import { ClientRegistry } from './client-registry';
import {
  OracleDefinition,
  RiskAdjustment,
  TokenBalance,
  TokenDefinition,
} from '..';
import { Routes } from '../server';
import { AllConfigurationQuery } from '../server/configuration-server';
import {
  AssetType,
  decodeERC1155Id,
  encodeERC1155Id,
  getMaturityForMarketIndex,
  getNowSeconds,
  Network,
  NotionalAddress,
  PERCENTAGE_BASIS,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
} from '@notional-finance/util';
import { Registry } from '../Registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Maybe, TokenType } from '../.graphclient';
import { BigNumber } from 'ethers';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath() {
    return Routes.Configuration;
  }

  constructor(cacheHostname: string) {
    super(cacheHostname);

    // Ensures that all subject keys get registered
    this.subjectRegistered.asObservable().subscribe((s) => {
      if (s) {
        this.subscribeSubject(s.network, s.key)?.subscribe((c) => {
          c?.vaultConfigurations.forEach((v) => {
            this.registerAllActiveVaultTokens(s.network, v.vaultAddress);
          });
        });
      }
    });
  }

  /**
   * This should only be done for simulations or testing.
   * @param network
   * @param update partial update to the configuration
   */
  updateVaultConfiguration(
    network: Network,
    vaultConfigs: Partial<AllConfigurationQuery['vaultConfigurations'][0]>[]
  ) {
    const latest = this.getLatestFromSubject(network, network);
    if (!latest) throw Error('Can only update after initialization');
    const newConfig = Object.assign(latest, {
      vaultConfigurations: vaultConfigs,
    });

    this._updateSubjectKeyDirect(network, network, newConfig, true);
  }

  getAllListedVaults(network: Network) {
    return this.getLatestFromSubject(network, network)?.vaultConfigurations;
  }

  getVaultConfig(network: Network, vaultAddress: string) {
    const vaultConfig = this.getLatestFromSubject(
      network,
      network
    )?.vaultConfigurations.find((v) => v.id == vaultAddress);
    if (!vaultConfig) throw Error(`Vault Config ${vaultAddress} not found`);

    return vaultConfig;
  }

  getVaultDiscountfCash(network: Network, vaultAddress: string) {
    const config = this.getVaultConfig(network, vaultAddress);
    return config.discountfCash || false;
  }

  getVaultActiveMaturities(network: Network, vaultAddress: string) {
    const config = this.getVaultConfig(network, vaultAddress);
    if (!config) throw Error('Vault configuration not found');
    return [...Array(config.maxBorrowMarketIndex).keys()]
      .map((i) => getMaturityForMarketIndex(i + 1))
      .concat(PRIME_CASH_VAULT_MATURITY);
  }

  getVaultBorrowWithFees(
    network: Network,
    vaultAddress: string,
    maturity: number,
    cashBorrowed: TokenBalance,
    blockTime = getNowSeconds()
  ) {
    const annualizedFeeRate = this.getVaultConfig(
      network,
      vaultAddress
    ).feeRateBasisPoints;
    const feeRate = Math.floor(
      annualizedFeeRate * ((maturity - blockTime) / SECONDS_IN_YEAR)
    );
    const vaultFee = cashBorrowed.scale(feeRate, RATE_PRECISION);
    return {
      cashBorrowed: cashBorrowed.sub(vaultFee),
      vaultFee,
    };
  }

  getVaultCapacity(network: Network, vaultAddress: string) {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
      primaryBorrowCurrency: { id },
    } = this.getVaultConfig(network, vaultAddress);

    return {
      minAccountBorrowSize: TokenBalance.fromID(
        minAccountBorrowSize,
        id,
        network
      ).scaleFromInternal(),
      // TODO: this does not include prime debt....
      totalUsedPrimaryBorrowCapacity: TokenBalance.fromID(
        totalUsedPrimaryBorrowCapacity,
        id,
        network
      ).scaleFromInternal(),
      maxPrimaryBorrowCapacity: TokenBalance.fromID(
        maxPrimaryBorrowCapacity,
        id,
        network
      ).scaleFromInternal(),
    };
  }

  getValidVaultCurrencies(network: Network, vaultAddress: string) {
    const vaultConfig = this.getVaultConfig(network, vaultAddress);
    const tokens = Registry.getTokenRegistry();
    const primaryCurrencyId = tokens.getTokenByID(
      network,
      vaultConfig.primaryBorrowCurrency.id
    ).currencyId;
    if (!primaryCurrencyId) throw Error('unknown borrow currency id');

    let secondaryOneTokenId: string | undefined;
    let secondaryTwoTokenId: string | undefined;
    let secondaryOneID: number | undefined;
    let secondaryTwoID: number | undefined;
    if (vaultConfig.secondaryBorrowCurrencies) {
      if (vaultConfig.secondaryBorrowCurrencies.length > 0) {
        secondaryOneTokenId = vaultConfig.secondaryBorrowCurrencies[0].id;
        secondaryOneID = tokens.getTokenByID(
          network,
          secondaryOneTokenId
        ).currencyId;
        if (!secondaryOneID) throw Error('unknown borrow currency id');
      }

      if (vaultConfig.secondaryBorrowCurrencies.length > 1) {
        secondaryTwoTokenId = vaultConfig.secondaryBorrowCurrencies[1].id;
        secondaryTwoID = tokens.getTokenByID(
          network,
          secondaryTwoTokenId
        ).currencyId;
        if (!secondaryTwoID) throw Error('unknown borrow currency id');
      }
    }

    return {
      validCurrencyIds: [primaryCurrencyId, secondaryOneID, secondaryTwoID] as [
        number,
        number | undefined,
        number | undefined
      ],
      validTokenIds: [
        vaultConfig.primaryBorrowCurrency.id,
        secondaryOneTokenId,
        secondaryTwoTokenId,
      ] as [string, string | undefined, string | undefined],
    };
  }

  private _vaultDebtAndCashIds(
    currencyId: number,
    vaultAddress: string,
    maturity: number
  ) {
    const debtID = encodeERC1155Id(
      currencyId,
      maturity,
      AssetType.VAULT_DEBT_ASSET_TYPE,
      false,
      vaultAddress
    );

    const cashID = encodeERC1155Id(
      currencyId,
      maturity,
      AssetType.VAULT_CASH_ASSET_TYPE,
      false,
      vaultAddress
    );

    return { debtID, cashID };
  }

  getVaultIDs(network: Network, vaultAddress: string, maturity: number) {
    if (maturity === 0) throw Error('Invalid maturity');
    const {
      validCurrencyIds: [primaryCurrencyId, secondaryOneID, secondaryTwoID],
      validTokenIds: [primaryTokenId, secondaryOneTokenId, secondaryTwoTokenId],
    } = this.getValidVaultCurrencies(network, vaultAddress);

    const vaultShareID = encodeERC1155Id(
      primaryCurrencyId,
      maturity,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      vaultAddress
    );
    const { debtID: primaryDebtID, cashID: primaryCashID } =
      this._vaultDebtAndCashIds(primaryCurrencyId, vaultAddress, maturity);

    let secondaryOneCashID: string | undefined;
    let secondaryTwoCashID: string | undefined;
    let secondaryOneDebtID: string | undefined;
    let secondaryTwoDebtID: string | undefined;

    if (secondaryOneID) {
      // First secondary
      ({ debtID: secondaryOneDebtID, cashID: secondaryOneCashID } =
        this._vaultDebtAndCashIds(secondaryOneID, vaultAddress, maturity));
    }

    if (secondaryTwoID) {
      // Two secondaries
      ({ debtID: secondaryTwoDebtID, cashID: secondaryTwoCashID } =
        this._vaultDebtAndCashIds(secondaryTwoID, vaultAddress, maturity));
    }

    return {
      vaultShareID,
      primaryDebtID,
      primaryCashID,
      secondaryOneDebtID,
      secondaryTwoDebtID,
      secondaryOneCashID,
      secondaryTwoCashID,
      primaryTokenId,
      secondaryOneTokenId,
      secondaryTwoTokenId,
    };
  }

  /**
   * Ensures that vault tokens are registered with the token registry if they
   * have not been created yet.
   * @param network
   * @param vaultAddress
   */
  registerAllActiveVaultTokens(network: Network, vaultAddress: string) {
    const tokens = Registry.getTokenRegistry();

    this.getVaultActiveMaturities(network, vaultAddress).forEach((maturity) => {
      const {
        vaultShareID,
        primaryDebtID,
        primaryCashID,
        secondaryOneDebtID,
        secondaryTwoDebtID,
        secondaryOneCashID,
        secondaryTwoCashID,
      } = this.getVaultIDs(network, vaultAddress, maturity);

      tokens.registerToken(
        this._vaultIdToTokenDefinition(vaultShareID, network)
      );
      tokens.registerToken(
        this._vaultIdToTokenDefinition(primaryDebtID, network)
      );
      tokens.registerToken(
        this._vaultIdToTokenDefinition(primaryCashID, network)
      );

      if (secondaryOneDebtID && secondaryOneCashID) {
        tokens.registerToken(
          this._vaultIdToTokenDefinition(secondaryOneDebtID, network)
        );
        tokens.registerToken(
          this._vaultIdToTokenDefinition(secondaryOneCashID, network)
        );
      }

      if (secondaryTwoDebtID && secondaryTwoCashID) {
        tokens.registerToken(
          this._vaultIdToTokenDefinition(secondaryTwoDebtID, network)
        );
        tokens.registerToken(
          this._vaultIdToTokenDefinition(secondaryTwoCashID, network)
        );
      }
    });
  }

  private _vaultIdToTokenDefinition(
    id: string,
    network: Network
  ): TokenDefinition {
    const { assetType, maturity, currencyId, vaultAddress } =
      decodeERC1155Id(id);
    if (!vaultAddress) throw Error('Undefined vault address');
    const underlying = Registry.getTokenRegistry().getUnderlying(
      network,
      currencyId
    );

    const vaultMaturityString =
      maturity === PRIME_CASH_VAULT_MATURITY
        ? ' Open Term'
        : ' Fixed Term @ ' + maturity;
    const vaultMaturitySymbol =
      maturity == PRIME_CASH_VAULT_MATURITY ? ':open' : ':fixed@' + maturity;

    let name: string;
    let symbol: string;
    let tokenType: TokenType;
    if (assetType == AssetType.VAULT_SHARE_ASSET_TYPE) {
      tokenType = 'VaultShare';
      name =
        'Vault Shares in ' +
        underlying.symbol +
        ' for ' +
        vaultAddress +
        vaultMaturityString;
      symbol =
        'vs' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
    } else if (assetType == AssetType.VAULT_DEBT_ASSET_TYPE) {
      tokenType = 'VaultDebt';
      name =
        'Vault ' +
        underlying.symbol +
        ' Debt for ' +
        vaultAddress +
        vaultMaturityString;
      symbol =
        'vd' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
    } else if (assetType == AssetType.VAULT_CASH_ASSET_TYPE) {
      tokenType = 'VaultCash';
      name =
        'Vault ' +
        underlying.symbol +
        ' Cash for ' +
        vaultAddress +
        vaultMaturityString;
      symbol =
        'vc' + underlying.symbol + ':' + vaultAddress + vaultMaturitySymbol;
    } else {
      throw Error('Unknown vault token type');
    }

    return {
      id,
      address: NotionalAddress[network].toLowerCase(),
      network,
      name,
      symbol,
      decimals: 8,
      tokenInterface: 'ERC1155',
      tokenType,
      underlying: underlying.id,
      maturity,
      vaultAddress: vaultAddress.toLowerCase(),
      isFCashDebt: false,
      currencyId: underlying.currencyId,
    };
  }

  getAllListedCurrencies(network: Network) {
    return this.getLatestFromSubject(network, network)?.currencyConfigurations;
  }

  getConfig(network: Network, currencyId: number) {
    const config = this.getLatestFromSubject(
      network,
      network
    )?.currencyConfigurations.find((c) => c.id === `${currencyId}`);
    if (!config) throw Error(`Currency Config ${currencyId} Not Found`);
    return config;
  }

  getDebtBuffer(network: Network, currencyId: number) {
    return this._assertDefined(this.getConfig(network, currencyId).debtBuffer);
  }

  getInterestRiskAdjustment(
    oracle: OracleDefinition,
    inverted: boolean,
    riskAdjusted: RiskAdjustment
  ) {
    if (oracle.oracleType !== 'fCashOracleRate' || riskAdjusted === 'None') {
      return {
        interestAdjustment: 0,
        maxDiscountFactor: RATE_PRECISION,
        oracleRateLimit: undefined,
      };
    }

    const token = Registry.getTokenRegistry().getTokenByID(
      oracle.network,
      inverted ? oracle.base : oracle.quote
    );
    if (!token.currencyId) throw Error('Invalid quote currency');
    const config = this.getConfig(oracle.network, token.currencyId);

    if (riskAdjusted === 'Asset') {
      return {
        interestAdjustment: -this._assertDefined(
          config.fCashHaircutBasisPoints
        ),
        maxDiscountFactor: this._assertDefined(config.fCashMaxDiscountFactor),
        oracleRateLimit: BigNumber.from(
          this._assertDefined(config.fCashMaxOracleRate)
        ),
      };
    } else {
      return {
        interestAdjustment: this._assertDefined(
          config.fCashDebtBufferBasisPoints
        ),
        maxDiscountFactor: RATE_PRECISION,
        oracleRateLimit: BigNumber.from(
          this._assertDefined(config.fCashMinOracleRate)
        ),
      };
    }
  }

  getExchangeRiskAdjustment(
    oracle: OracleDefinition,
    inverted: boolean,
    riskAdjusted: RiskAdjustment
  ) {
    if (riskAdjusted === 'None') return PERCENTAGE_BASIS;
    const token = Registry.getTokenRegistry().getTokenByID(
      oracle.network,
      inverted ? oracle.base : oracle.quote
    );
    if (!token.currencyId) throw Error('Invalid quote currency');
    const config = this.getConfig(oracle.network, token.currencyId);

    if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Debt') {
      return this._assertDefined(config.debtBuffer);
    } else if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Asset') {
      return this._assertDefined(config.collateralHaircut);
    } else if (oracle.oracleType === 'nTokenToUnderlyingExchangeRate') {
      return this._assertDefined(config.pvHaircutPercentage);
    } else {
      return PERCENTAGE_BASIS;
    }
  }

  private _assertDefined<T>(v: Maybe<T> | undefined): T {
    if (v === undefined || v === null) throw Error(`Undefined Value`);
    return v as T;
  }
}
