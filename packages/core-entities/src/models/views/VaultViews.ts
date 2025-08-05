import { VaultAddress } from '@notional-finance/util';
import { PendlePT, SingleSidedLP } from '../../vaults';
import { whitelistedVaults } from '../../config/whitelisted-vaults';
import { getPoolInstance_ } from './ExchangeViews';
import { ChartType } from '../ModelTypes';
import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { TokenViews } from './TokenViews';
import { AnalyticsViews } from './AnalyticsViews';
import { PendlePTVaultParams } from '../../vaults/PendlePT';
import { SingleSidedLPParams } from '../../vaults/SingleSidedLP';

export const VaultViews = (self: Instance<typeof NetworkModel>) => {
  const { getTokenByID } = TokenViews(self);
  const { getTimeSeries } = AnalyticsViews(self);

  const isVaultEnabled = (vaultAddress: string) => {
    return self.vaults.get(vaultAddress)?.enabled || false;
  };

  const getVaultAdapter = (vaultAddress: string) => {
    const params = self.vaults.get(vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    const v = self.configuration?.vaults.find(
      (c) => c.vaultAddress === vaultAddress
    );
    if (!v) throw Error(`Configuration not found for ${vaultAddress}`);
    const primaryToken = getTokenByID(v.depositToken.id);

    switch (v.strategyType) {
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
        throw Error(`Unknown vault type: ${v.strategyType}`);
    }
  };

  const getVaultName = (vaultAddress: string) => {
    const vault = self.configuration?.vaults.find(
      (v) => v.vaultAddress === vaultAddress
    );
    if (!vault) throw Error(`No vault params found: ${vaultAddress}`);
    return vault.name;
  };

  const getAllListedVaults = (onlyWhitelisted = true) => {
    return self.configuration?.vaults.filter((v) =>
      onlyWhitelisted
        ? whitelistedVaults(self.network).includes(
            v.vaultAddress.toLowerCase() as Lowercase<VaultAddress>
          )
        : true
    );
  };

  return {
    getAllListedVaults,
    isVaultEnabled,
    getVaultAdapter,
    getVaultName,
  };
};
