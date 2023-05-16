import { ClientRegistry } from './client-registry';
import { Routes } from '../server';
import { AllConfigurationQuery } from '../server/configuration-server';
import { AssetType, encodeERC1155Id, Network } from '@notional-finance/util';
import { Registry } from '../Registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Maybe } from '../.graphclient';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath = Routes.Configuration;

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
    const tokens = Registry.getTokenRegistry();
    const vaultConfig = this.getVaultConfig(network, vaultAddress);

    const primaryCurrencyId = tokens.getTokenByID(
      network,
      vaultConfig.primaryBorrowCurrency.id
    ).currencyId;
    if (!primaryCurrencyId) throw Error('unknown borrow currency id');

    const vaultShareID = encodeERC1155Id(
      primaryCurrencyId,
      maturity,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      vaultAddress
    );
    const { debtID: primaryDebtID, cashID: primaryCashID } =
      this._vaultDebtAndCashIds(primaryCurrencyId, vaultAddress, maturity);

    let secondaryOneCashID = undefined;
    let secondaryTwoCashID = undefined;
    let secondaryOneDebtID = undefined;
    let secondaryTwoDebtID = undefined;
    let secondaryOneTokenId = undefined;
    let secondaryTwoTokenId = undefined;

    if (vaultConfig.secondaryBorrowCurrencies) {
      if (vaultConfig.secondaryBorrowCurrencies.length > 0) {
        // First secondary
        secondaryOneTokenId = vaultConfig.secondaryBorrowCurrencies[0].id;
        const secondaryOneID = tokens.getTokenByID(
          network,
          secondaryOneTokenId
        ).currencyId;
        if (!secondaryOneID) throw Error('unknown borrow currency id');

        ({ debtID: secondaryOneDebtID, cashID: secondaryOneCashID } =
          this._vaultDebtAndCashIds(secondaryOneID, vaultAddress, maturity));
      }

      if (vaultConfig.secondaryBorrowCurrencies.length == 2) {
        // Two secondaries
        secondaryTwoTokenId = vaultConfig.secondaryBorrowCurrencies[1].id;
        const secondaryTwoID = tokens.getTokenByID(
          network,
          secondaryTwoTokenId
        ).currencyId;
        if (!secondaryTwoID) throw Error('unknown borrow currency id');

        ({ debtID: secondaryTwoDebtID, cashID: secondaryTwoCashID } =
          this._vaultDebtAndCashIds(secondaryTwoID, vaultAddress, maturity));
      }
    }

    return {
      vaultShareID,
      primaryDebtID,
      primaryCashID,
      secondaryOneDebtID,
      secondaryTwoDebtID,
      secondaryOneCashID,
      secondaryTwoCashID,
      primaryTokenId: vaultConfig.primaryBorrowCurrency.id,
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

  private _assertDefined<T>(v: Maybe<T> | undefined): T {
    if (v === undefined || v === null) throw Error(`Undefined Value`);
    return v as T;
  }
}
