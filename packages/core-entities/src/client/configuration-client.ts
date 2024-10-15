import { ClientRegistry } from './client-registry';
import {
  OracleDefinition,
  RiskAdjustment,
  Routes,
  TokenBalance,
  TokenDefinition,
} from '..';
import { AllConfigurationQuery } from '../server/configuration-server';
import {
  AssetType,
  decodeERC1155Id,
  encodeERC1155Id,
  getMaturityForMarketIndex,
  getNowSeconds,
  getProviderFromNetwork,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  PERCENTAGE_BASIS,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR,
} from '@notional-finance/util';
import { Registry } from '../Registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Maybe, TokenType } from '../.graphclient';
import { BigNumber, Contract } from 'ethers';
import { OracleRegistryClient } from './oracle-registry-client';
import {
  LeveragedNTokenAdapter,
  LeveragedNTokenAdapterABI,
  SecondaryRewarder,
  SecondaryRewarderABI,
} from '@notional-finance/contracts';

const toLower = <T extends string>(address: T) =>
  address.toLowerCase() as Lowercase<T>;

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath() {
    return Routes.Configuration;
  }

  constructor(cacheHostname: string) {
    super(cacheHostname);
    // Don't enforce freshness intervals if the subgraph happens to go down. Configuration
    // data does not change very often
    this.defaultFreshnessIntervals = 0;

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

  static getBaseProtocol = (boosterProtocol: string) => {
    switch (boosterProtocol) {
      case 'Curve':
        return 'Curve';
      case 'Convex':
        return 'Curve';
      case 'Aura':
        return 'Balancer';
      case 'Balancer':
        return 'Balancer';
      default:
        return 'unknown';
    }
  };

  static parseVaultName(name: string) {
    if (name === 'Curve FRAX/USDC LP (FRAX Leverage)') {
      name = 'SingleSidedLP:Convex:[FRAX]/USDC.e';
    }

    try {
      if (name.startsWith('Pendle')) {
        const [protocol, poolName, _] = name.split(':');
        return {
          technicalName: name,
          boosterProtocol: protocol,
          poolName: poolName,
          baseProtocol: protocol,
          name: poolName,
        };
      } else {
        const [_, boosterProtocol, pool] = name.split(':');
        const poolName = pool.replace('[', '').replace(']', '');
        return {
          technicalName: name,
          boosterProtocol,
          poolName,
          baseProtocol: ConfigurationClient.getBaseProtocol(boosterProtocol),
          name: `${boosterProtocol}: ${poolName}`,
        };
      }
    } catch {
      return {
        technicalName: name,
        boosterProtocol: 'unknown',
        poolName: 'unknown',
        baseProtocol: 'unknown',
        name,
      };
    }
  }

  protected _parseVaultConfig(
    network: Network,
    vaultConfig: AllConfigurationQuery['vaultConfigurations'][0]
  ) {
    let enabled = vaultConfig.enabled;
    try {
      enabled = Registry.getVaultRegistry().isVaultEnabled(
        network,
        vaultConfig.vaultAddress
      );
    } catch (e) {
      // Ignore if if registry is not initialized yet, this is only relevant
      // for Pendle PT vaults which mature at a later date.
    }

    return {
      ...vaultConfig,
      ...ConfigurationClient.parseVaultName(vaultConfig.name),
      enabled,
    };
  }

  getAllListedVaults(network: Network, includeDisabled = false) {
    return this.getLatestFromSubject(network, network)
      ?.vaultConfigurations.map((v) => this._parseVaultConfig(network, v))
      .filter((v) => v.enabled || includeDisabled);
  }

  getVaultConfig(network: Network, vaultAddress: string) {
    const vaultConfig = this.getLatestFromSubject(
      network,
      network
    )?.vaultConfigurations.find((v) => v.id == vaultAddress);
    if (!vaultConfig) throw Error(`Vault Config ${vaultAddress} not found`);
    return this._parseVaultConfig(network, vaultConfig);
  }

  getVaultName(network: Network, vaultAddress: string) {
    return this.getVaultConfig(network, vaultAddress).name;
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
    if (cashBorrowed.tokenType !== 'PrimeCash')
      throw Error('Cash must be prime cash');

    if (maturity === PRIME_CASH_VAULT_MATURITY) {
      return {
        cashBorrowed,
        vaultFee: cashBorrowed.copy(0),
        feeRate: RATE_PRECISION,
      };
    }

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
      feeRate,
    };
  }

  getVaultCapacity(network: Network, vaultAddress: string) {
    const {
      minAccountBorrowSize,
      totalUsedPrimaryBorrowCapacity,
      maxPrimaryBorrowCapacity,
      primaryBorrowCurrency: { id },
    } = this.getVaultConfig(network, vaultAddress);
    const primeDebt = Registry.getTokenRegistry().getVaultDebt(
      network,
      vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );

    return {
      minAccountBorrowSize: TokenBalance.fromID(
        minAccountBorrowSize,
        id,
        network
      ).scaleFromInternal(),
      totalUsedPrimaryBorrowCapacity: TokenBalance.fromID(
        totalUsedPrimaryBorrowCapacity,
        id,
        network
      )
        .scaleFromInternal()
        .add(
          primeDebt.totalSupply?.toUnderlying() ||
            TokenBalance.fromID(0, id, network)
        ),
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
        this.vaultIdToTokenDefinition(vaultShareID, network)
      );
      tokens.registerToken(
        this.vaultIdToTokenDefinition(primaryDebtID, network)
      );
      tokens.registerToken(
        this.vaultIdToTokenDefinition(primaryCashID, network)
      );

      if (secondaryOneDebtID && secondaryOneCashID) {
        tokens.registerToken(
          this.vaultIdToTokenDefinition(secondaryOneDebtID, network)
        );
        tokens.registerToken(
          this.vaultIdToTokenDefinition(secondaryOneCashID, network)
        );
      }

      if (secondaryTwoDebtID && secondaryTwoCashID) {
        tokens.registerToken(
          this.vaultIdToTokenDefinition(secondaryTwoDebtID, network)
        );
        tokens.registerToken(
          this.vaultIdToTokenDefinition(secondaryTwoCashID, network)
        );
      }
    });
  }

  public vaultIdToTokenDefinition(
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
      address: toLower(NotionalAddress[network]),
      network,
      name,
      symbol,
      decimals: 8,
      tokenInterface: 'ERC1155',
      tokenType,
      underlying: underlying.id,
      maturity,
      vaultAddress: toLower(vaultAddress),
      isFCashDebt: false,
      currencyId: underlying.currencyId,
    };
  }

  getAllListedCurrencies(network: Network) {
    return this.getLatestFromSubject(network, network)?.currencyConfigurations;
  }

  getMaxSupply(network: Network, currencyId: number) {
    const underlying = Registry.getTokenRegistry().getUnderlying(
      network,
      currencyId
    );
    const pCash = Registry.getTokenRegistry().getPrimeCash(network, currencyId);
    const maxUnderlyingSupply = TokenBalance.from(
      this._assertDefined(
        this.getConfig(network, currencyId).maxUnderlyingSupply
      ),
      underlying
    ).scaleFromInternal();
    if (!pCash.totalSupply) throw Error('pCash total supply not found');
    const currentUnderlyingSupply = pCash.totalSupply.toUnderlying();

    return {
      maxUnderlyingSupply,
      currentUnderlyingSupply,
      capacityRemaining: maxUnderlyingSupply.sub(currentUnderlyingSupply),
    };
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
    if (
      (oracle.oracleType !== 'fCashOracleRate' &&
        oracle.oracleType !== 'fCashSpotRate') ||
      riskAdjusted === 'None'
    ) {
      return {
        interestAdjustment: 0,
        maxDiscountFactor: SCALAR_PRECISION,
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
        interestAdjustment: this._assertDefined(config.fCashHaircutBasisPoints),
        maxDiscountFactor: BigNumber.from(
          this._assertDefined(config.fCashMaxDiscountFactor)
        ).mul(RATE_PRECISION),
        oracleRateLimit: BigNumber.from(
          this._assertDefined(config.fCashMaxOracleRate)
        ),
      };
    } else {
      return {
        interestAdjustment: this._assertDefined(
          config.fCashDebtBufferBasisPoints
        ),
        maxDiscountFactor: SCALAR_PRECISION,
        oracleRateLimit: BigNumber.from(
          this._assertDefined(config.fCashMinOracleRate)
        ),
      };
    }
  }
  getCurrencyHaircutAndBuffer(token: TokenDefinition) {
    if (!token.currencyId) throw Error('Invalid token currency');
    const config = this.getConfig(token.network, token.currencyId);
    return {
      haircut: this._assertDefined(config.collateralHaircut),
      buffer: this._assertDefined(config.debtBuffer),
    };
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

    if (oracle.id === 'UNIT_RATE') {
      return PERCENTAGE_BASIS;
    } else if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Debt') {
      return this._assertDefined(config.debtBuffer);
    } else if (oracle.oracleType === 'Chainlink' && riskAdjusted === 'Asset') {
      return this._assertDefined(config.collateralHaircut);
    } else if (oracle.oracleType === 'nTokenToUnderlyingExchangeRate') {
      return this._assertDefined(config.pvHaircutPercentage);
    } else {
      return PERCENTAGE_BASIS;
    }
  }

  getVaultLeverageFactors(network: Network, vaultAddress: string) {
    const vaultConfig = this.getVaultConfig(network, vaultAddress);
    const minLeverageRatio =
      RATE_PRECISION /
      (vaultConfig.maxRequiredAccountCollateralRatioBasisPoints as number);
    const defaultLeverageRatio =
      RATE_PRECISION / vaultConfig.maxDeleverageCollateralRatioBasisPoints;
    const maxLeverageRatio =
      RATE_PRECISION / vaultConfig.minCollateralRatioBasisPoints;

    return { minLeverageRatio, defaultLeverageRatio, maxLeverageRatio };
  }

  getNTokenLeverageFactors(nToken: TokenDefinition) {
    if (!nToken.currencyId) throw Error('Invalid nToken');

    const config = this.getConfig(nToken.network, nToken.currencyId);
    const nTokenHaircut =
      (this._assertDefined(config.pvHaircutPercentage) * RATE_PRECISION) / 100;

    return {
      nTokenHaircut,
    };
  }

  getMinLendRiskAdjustedDiscountFactor(fCash: TokenDefinition) {
    if (!fCash.currencyId || !fCash.maturity) throw Error('Invalid fCash');
    const config = this.getConfig(fCash.network, fCash.currencyId);
    const fCashMarket = Registry.getExchangeRegistry().getfCashMarket(
      fCash.network,
      fCash.currencyId
    );
    const marketIndex = fCashMarket.getMarketIndex(fCash.maturity);

    // Convert this to an exchange rate
    const maxMarketInterestRate =
      fCashMarket.poolParams.interestRateCurve[marketIndex - 1].maxRate -
      this._assertDefined(config.fCashHaircutBasisPoints);
    const maxInterestRate = Math.max(
      maxMarketInterestRate,
      this._assertDefined(config.fCashMinOracleRate)
    );
    const discountRate = OracleRegistryClient.interestToExchangeRate(
      BigNumber.from(maxInterestRate).mul(-1),
      fCash.maturity
    )
      .mul(RATE_PRECISION)
      .div(SCALAR_PRECISION);

    const lowestDiscountFactor = Math.min(
      discountRate.toNumber(),
      this._assertDefined(config.fCashMaxDiscountFactor)
    );

    return {
      lowestDiscountFactor,
      maxDiscountFactor: this._assertDefined(config.fCashMaxDiscountFactor),
    };
  }

  getSecondaryRewarder(nToken: TokenDefinition) {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = this.getConfig(nToken.network, nToken.currencyId);

    return config.incentives?.secondaryIncentiveRewarder
      ? (new Contract(
          config.incentives?.secondaryIncentiveRewarder,
          SecondaryRewarderABI,
          getProviderFromNetwork(nToken.network)
        ) as SecondaryRewarder)
      : undefined;
  }

  getAnnualizedSecondaryIncentives(nToken: TokenDefinition) {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = this.getConfig(nToken.network, nToken.currencyId);
    if (!config.incentives?.currentSecondaryReward) return undefined;
    const rewardEndTime = config.incentives.secondaryRewardEndTime as
      | number
      | undefined;
    if (rewardEndTime && rewardEndTime < getNowSeconds()) return undefined;

    const rewardToken = Registry.getTokenRegistry().getTokenByID(
      nToken.network,
      config.incentives.currentSecondaryReward.id
    );
    const incentiveEmissionRate = TokenBalance.fromFloat(
      BigNumber.from(
        (config.incentives.secondaryEmissionRate as string | undefined) || 0
      ).toNumber() / INTERNAL_TOKEN_PRECISION,
      rewardToken
    );
    const accumulatedRewardPerNToken = config.incentives
      ?.accumulatedSecondaryRewardPerNToken
      ? TokenBalance.from(
          // This value is stored in 18 decimals but we want to scale it to reward token precision
          BigNumber.from(config.incentives.accumulatedSecondaryRewardPerNToken)
            .mul(TokenBalance.unit(rewardToken).precision)
            .div(SCALAR_PRECISION),
          rewardToken
        )
      : undefined;

    return {
      rewardToken,
      incentiveEmissionRate,
      accumulatedRewardPerNToken,
      lastAccumulatedTime: config.incentives?.lastAccumulatedTime as
        | number
        | undefined,
      rewardEndTime: config.incentives.secondaryRewardEndTime as number,
    };
  }

  getAnnualizedNOTEIncentives(nToken: TokenDefinition) {
    if (!nToken.currencyId) throw Error('Invalid nToken');
    const config = this.getConfig(nToken.network, nToken.currencyId);
    const NOTE = Registry.getTokenRegistry().getTokenBySymbol(
      nToken.network,
      'NOTE'
    );

    const incentiveEmissionRate = TokenBalance.from(
      BigNumber.from(
        (config.incentives?.incentiveEmissionRate as string | undefined) || 0
      ).mul(INTERNAL_TOKEN_PRECISION),
      NOTE
    );

    const accumulatedNOTEPerNToken = config.incentives?.accumulatedNOTEPerNToken
      ? // NOTE: this value is stored in 18 decimals natively, but downscale it here
        // for calculations
        TokenBalance.from(
          config.incentives.accumulatedNOTEPerNToken,
          NOTE
        ).scale(INTERNAL_TOKEN_PRECISION, SCALAR_PRECISION)
      : undefined;

    return {
      incentiveEmissionRate,
      lastAccumulatedTime: config.incentives?.lastAccumulatedTime as
        | number
        | undefined,
      accumulatedNOTEPerNToken,
    };
  }

  getLeveragedNTokenAdapter(network: Network) {
    const address = this.getLatestFromSubject(
      network,
      network
    )?.whitelistedContracts.find(
      ({ name }) => name === 'Leveraged NToken Adapter'
    )?.id;
    if (!address) throw Error('Leveraged NToken Adapter not found');

    return new Contract(
      address,
      LeveragedNTokenAdapterABI,
      getProviderFromNetwork(network)
    ) as LeveragedNTokenAdapter;
  }

  private _assertDefined<T>(v: Maybe<T> | undefined): T {
    if (v === undefined || v === null) throw Error(`Undefined Value`);
    return v as T;
  }
}
