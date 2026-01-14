import { VaultAddress } from '@notional-finance/util';
import { PendlePT, SingleSidedLP, WithdrawManager } from '../../vaults';
import { whitelistedVaults } from '../../config/whitelisted-vaults';
import { getPoolInstance_ } from './ExchangeViews';
import { ChartType } from '../ModelTypes';
import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';
import { TokenViews } from './TokenViews';
import { AnalyticsViews } from './AnalyticsViews';
import { PendlePTVaultParams } from '../../vaults/PendlePT';
import { SingleSidedLPParams } from '../../vaults/SingleSidedLP';
import { Staking, StakingVaultParams } from '../../vaults/Staking';
import { ethers } from 'ethers';

export const VaultViews = (self: Instance<typeof NetworkModel>) => {
  const { getTokenByID } = TokenViews(self);
  const { getTimeSeries } = AnalyticsViews(self);

  const isVaultEnabled = (vaultAddress: string) => {
    return self.vaults.get(vaultAddress)?.enabled || false;
  };

  const getYieldToken = (vaultAddress: string) => {
    const v = self.configuration?.vaults.find(
      (v) => v.vaultAddress === vaultAddress
    );
    if (!v) throw Error(`No vault params found: ${vaultAddress}`);
    return getTokenByID(v.yieldToken.id);
  };

  const getVaultAdapter = (vaultAddress: string) => {
    const params = self.vaults.get(vaultAddress);
    if (!params) throw Error(`No vault params found: ${vaultAddress}`);
    const v = self.configuration?.vaults.find(
      (c) => c.vaultAddress === vaultAddress
    );
    if (!v) throw Error(`Configuration not found for ${vaultAddress}`);
    const primaryToken = getTokenByID(v.depositToken.id);
    const yieldToken = getTokenByID(v.yieldToken.id);

    switch (params.strategyType) {
      case 'CurveConvex2Token':
        return new SingleSidedLP(
          self.network,
          vaultAddress,
          params as SingleSidedLPParams,
          getPoolInstance_(self, (params as SingleSidedLPParams).pool),
          primaryToken,
          yieldToken,
          getTimeSeries(v.vaultAddress, ChartType.APY)?.data
        );
      case 'PendlePT':
        return new PendlePT(
          self.network,
          vaultAddress,
          params as PendlePTVaultParams,
          primaryToken,
          yieldToken
        );
      case 'Staking':
        return new Staking(
          self.network,
          vaultAddress,
          params as StakingVaultParams,
          primaryToken,
          yieldToken,
          getTimeSeries(v.vaultAddress, ChartType.APY)?.data
        );
      default:
        throw Error(`Unknown vault type: ${params.strategyType}`);
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
    return (
      self.configuration?.vaults.filter((v) =>
        onlyWhitelisted
          ? whitelistedVaults(self.network).includes(
              v.vaultAddress.toLowerCase() as Lowercase<VaultAddress>
            )
          : true
      ) || []
    );
  };

  const getVaultConfig = (vaultAddress: string) => {
    const v = self.configuration?.vaults.find(
      (v) => v.vaultAddress === vaultAddress
    );
    const vaultParams = self.vaults.get(vaultAddress);
    if (!v || !vaultParams)
      throw Error(`No vault params found: ${vaultAddress}`);
    return {
      ...v,
      strategyType: vaultParams.strategyType,
      enabled: vaultParams.enabled,
    };
  };

  const getVaultFee = (vaultAddress: string) => {
    const v = getVaultConfig(vaultAddress);
    return parseFloat(ethers.utils.formatUnits(v.feeRate, 18)) * 100;
  };

  const getWithdrawManagers = (vaultAddress: string) => {
    const v = getVaultConfig(vaultAddress);
    return v.withdrawRequestManagers.map((wrm) => {
      return new WithdrawManager(
        wrm.id,
        v.strategyType,
        getTokenByID(wrm.stakingToken.id),
        getTokenByID(wrm.withdrawToken.id),
        getTokenByID(wrm.yieldToken.id)
      );
    });
  };

  return {
    getWithdrawManagers,
    getAllListedVaults,
    isVaultEnabled,
    getYieldToken,
    getVaultAdapter,
    getVaultName,
    getVaultConfig,
    getVaultFee,
  };
};
