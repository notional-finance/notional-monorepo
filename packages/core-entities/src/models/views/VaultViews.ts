import {
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
  VaultAddress,
} from '@notional-finance/util';
import { PendlePT, SingleSidedLP } from '../../vaults';
import { TokenBalance } from '../../token-balance';
import {
  getVaultType,
  whitelistedVaults,
} from '../../config/whitelisted-vaults';
import { getPoolInstance_ } from './ExchangeViews';
import { ChartType } from '../ModelTypes';
import { getSnapshot, Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { TokenViews } from './TokenViews';
import { AnalyticsViews } from './AnalyticsViews';
import { TokenDefinition } from '../../Definitions';
import { PendlePTVaultParams } from '../../vaults/PendlePT';
import { SingleSidedLPParams } from '../../vaults/SingleSidedLP';

export const VaultViews = (self: Instance<typeof NetworkModel>) => {
  const { getTokenByID, getVaultDebt } = TokenViews(self);
  const { getTimeSeries } = AnalyticsViews(self);

  const isVaultEnabled = (vaultAddress: string) => {
    return self.vaults.get(vaultAddress)?.enabled || false;
  };

  const getVaultAdapter = (vaultAddress: string) => {
    const params = self.vaults.get(vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    const v = self.configuration?.vaultConfigurations.find(
      (c) => c.id === vaultAddress
    );
    if (!v) throw Error(`Configuration not found for ${vaultAddress}`);
    const primaryToken = getTokenByID(v.primaryBorrowCurrency.id);
    if (!primaryToken.currencyId)
      throw Error(`Token not found for ${vaultAddress}`);
    const vaultType = getVaultType(vaultAddress, self.network);

    switch (vaultType) {
      case 'SingleSidedLP_AutoReinvest':
      case 'SingleSidedLP_DirectClaim':
      case 'SingleSidedLP_Points':
        return new SingleSidedLP(
          self.network,
          vaultAddress,
          params as SingleSidedLPParams,
          getPoolInstance_(self, (params as SingleSidedLPParams).pool),
          primaryToken,
          getTimeSeries(v.vaultAddress, ChartType.APY)?.data
        );
      case 'PendlePT':
        return new PendlePT(
          self.network,
          vaultAddress,
          params as PendlePTVaultParams,
          primaryToken
        );
      default:
        throw Error(`Unknown vault type: ${vaultType}`);
    }
  };

  const getVaultName = (vaultAddress: string) => {
    const vault = self.vaults.get(vaultAddress);
    if (!vault) throw Error(`No vault params found: ${vaultAddress}`);
    return vault.name;
  };

  const getAllListedVaults = (
    onlyWhitelisted = true,
    includeDisabled = false
  ) => {
    return (
      self.configuration?.vaultConfigurations
        .filter((v) =>
          onlyWhitelisted
            ? whitelistedVaults(self.network).includes(
                v.vaultAddress.toLowerCase() as Lowercase<VaultAddress>
              )
            : true
        )
        .map((v) => getVaultConfig(v.vaultAddress))
        .filter((v) => v.enabled || includeDisabled) || []
    );
  };

  return {
    getAllListedVaults,
    isVaultEnabled,
    getVaultAdapter,
    getVaultName,
  };
};
