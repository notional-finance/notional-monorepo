import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  GATED_VAULTS,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';
import { PRODUCTS } from '@notional-finance/util';
import { useWalletCommunities } from './use-wallet';
import { getVaultType, SingleSidedLP } from '@notional-finance/core-entities';

export function useVaultNftCheck() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const vaultAddress = pathname.split('/')[2];
  const communityMembership = useWalletCommunities();

  useEffect(() => {
    if (vaultAddress) {
      const gatedTo = GATED_VAULTS[vaultAddress] || [];
      if (gatedTo.length) {
        const hasMembership = communityMembership?.find(({ name }) =>
          gatedTo.includes(name)
        );

        if (!hasMembership) navigate('/vaults');
      }
    }
  }, [communityMembership, navigate, vaultAddress]);
}

export function useVaultPoints(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress &&
    getVaultType(vaultAddress, currentNetworkStore.network) ===
      'SingleSidedLP_Points'
    ? currentNetworkStore.getVaultAdapter(vaultAddress).getPointMultiples()
    : undefined;
}

export function useVaultRewardTokens(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress &&
    getVaultType(vaultAddress, currentNetworkStore.network) ===
      'SingleSidedLP_DirectClaim'
    ? (
        currentNetworkStore.getVaultAdapter(vaultAddress) as SingleSidedLP
      ).rewardTokens.map((t) => currentNetworkStore.getTokenByID(t))
    : undefined;
}

export function useVaultProperties(vaultAddress?: string) {
  const currentNetworkStore = useCurrentNetworkStore();
  return vaultAddress
    ? currentNetworkStore.getVaultConfig(vaultAddress)
    : undefined;
}

export function useAllVaults(vaultProduct?: PRODUCTS) {
  const currentNetworkStore = useCurrentNetworkStore();
  const vaults = currentNetworkStore.getAllListedVaultsWithYield();

  if (vaultProduct) {
    return vaults.filter((v) => {
      switch (vaultProduct) {
        case PRODUCTS.LEVERAGED_PENDLE:
          return v.vaultConfig.vaultType === 'PendlePT';
        case PRODUCTS.LEVERAGED_POINTS_FARMING:
          return v.vaultConfig.vaultType === 'SingleSidedLP_Points';
        case PRODUCTS.LEVERAGED_YIELD_FARMING:
          return (
            v.vaultConfig.vaultType !== 'SingleSidedLP_Points' &&
            v.vaultConfig.vaultType.startsWith('SingleSidedLP')
          );
        default:
          return false;
      }
    });
  } else {
    return vaults;
  }
}
