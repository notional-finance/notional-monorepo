import { useEffect } from 'react';
import {
  Registry,
  TokenBalance,
  whitelistedVaults,
} from '@notional-finance/core-entities';
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

  if (vaultAddress && network) {
    try {
      const config = Registry.getConfigurationRegistry();
      ({ minAccountBorrowSize } = config.getVaultCapacity(
        network,
        vaultAddress
      ));
      const vaultConfig = config.getVaultConfig(network, vaultAddress);
      vaultName = config.getVaultName(network, vaultAddress);

      if (vaultConfig) {
        enabled = vaultConfig.enabled;
        minDepositRequired = getMinDepositRequiredString(
          minAccountBorrowSize,
          vaultConfig.maxDeleverageCollateralRatioBasisPoints,
          vaultConfig.maxRequiredAccountCollateralRatioBasisPoints as number
        );
      }
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
  if (!network) return [];

  const config = Registry.getConfigurationRegistry();
  const listedVaults = config
    .getAllListedVaults(network)
    ?.filter((v) => whitelistedVaults(network).includes(v.vaultAddress))
    .map((v) => {
      const {
        minAccountBorrowSize,
        totalUsedPrimaryBorrowCapacity,
        maxPrimaryBorrowCapacity,
      } = config.getVaultCapacity(network, v.vaultAddress);
      const primaryToken = Registry.getTokenRegistry().getTokenByID(
        network,
        v.primaryBorrowCurrency.id
      );
      const vaultTVL = Registry.getTokenRegistry()
        .getAllTokens(network)
        .filter(
          (t) =>
            t.tokenType === 'VaultShare' && t.vaultAddress === v.vaultAddress
        )
        .reduce((tvl, t) => {
          if (t.totalSupply) {
            return tvl.add(t.totalSupply.toUnderlying());
          } else {
            return tvl;
          }
        }, TokenBalance.zero(primaryToken));

      return {
        ...v,
        vaultTVL,
        minAccountBorrowSize,
        totalUsedPrimaryBorrowCapacity,
        maxPrimaryBorrowCapacity,
        minDepositRequired: getMinDepositRequiredString(
          minAccountBorrowSize,
          v.maxDeleverageCollateralRatioBasisPoints,
          v.maxRequiredAccountCollateralRatioBasisPoints as number
        ),
        primaryToken,
      };
    });

  return listedVaults || [];
}

function getMinDepositRequiredString(
  minAccountBorrowSize: TokenBalance,
  maxDeleverageCollateralRatioBasisPoints: number,
  maxRequiredAccountCollateralRatioBasisPoints: number
) {
  const lowerDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxDeleverageCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);

  const upperDeposit = minAccountBorrowSize
    .mulInRatePrecision(maxRequiredAccountCollateralRatioBasisPoints)
    .toDisplayStringWithSymbol(2);
  return `${lowerDeposit} to ${upperDeposit}`;
}
