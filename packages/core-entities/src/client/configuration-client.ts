import { ClientRegistry } from './client-registry';
import { OracleDefinition, RiskAdjustment } from '..';
import { Routes } from '../server';
import { AllConfigurationQuery } from '../server/configuration-server';
import {
  AssetType,
  encodeERC1155Id,
  Network,
  PERCENTAGE_BASIS,
  RATE_PRECISION,
} from '@notional-finance/util';
import { Registry } from '../Registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Maybe } from '../.graphclient';
import { BigNumber } from 'ethers';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath() {
    return Routes.Configuration;
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
    return config.discountfCash;
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
