import { useEffect } from 'react';
import { getNetworkModel, TokenBalance } from '@notional-finance/core-entities';
import { useLocation, useNavigate } from 'react-router-dom';
import { GATED_VAULTS } from '@notional-finance/notionable';
import { useNotionalError } from './use-notional';
import { Network } from '@notional-finance/util';
import { useWalletCommunities } from './use-wallet';

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

export function useVaultProperties(
  network: Network | undefined,
  vaultAddress?: string
) {
  let minAccountBorrowSize: TokenBalance | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let vaultName: string | undefined = undefined;
  let enabled = true;

  const { reportError } = useNotionalError();

  const model = getNetworkModel(network);
  if (vaultAddress && network && model) {
    try {
      const vaultConfig = model.getVaultConfig(vaultAddress);
      minAccountBorrowSize = vaultConfig.minAccountBorrowSize;
      minDepositRequired = vaultConfig.minDepositRequired;
      vaultName = vaultConfig.name;
      enabled = vaultConfig.enabled;
    } catch (e) {
      // Throws an error on an unknown vault address
      reportError({ ...(e as Error), code: 404, msg: 'Unknown Vault' });
    }
  }

  return {
    vaultName,
    minAccountBorrowSize,
    minDepositRequired,
    enabled,
  };
}

export function useAllVaults(network: Network | undefined) {
  return getNetworkModel(network).getAllListedVaults();
}
