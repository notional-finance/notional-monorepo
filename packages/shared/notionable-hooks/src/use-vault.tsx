import { useEffect } from 'react';
import {
  Registry,
  TokenBalance,
  whitelistedVaults,
} from '@notional-finance/core-entities';
import { useHistory, useLocation } from 'react-router-dom';
import { GATED_VAULTS } from '@notional-finance/notionable';
import { useNotionalContext, useNotionalError } from './use-notional';
import { Network } from '@notional-finance/util';

export function useVaultNftCheck() {
  const history = useHistory();
  const { pathname } = useLocation();
  const vaultAddress = pathname.split('/')[2];
  const {
    globalState: { communityMembership },
  } = useNotionalContext();

  useEffect(() => {
    if (vaultAddress) {
      const gatedTo = GATED_VAULTS[vaultAddress] || [];
      if (gatedTo.length) {
        const hasMembership = communityMembership?.find((c) =>
          gatedTo.includes(c)
        );

        if (!hasMembership) history.push('/vaults');
      }
    }
  }, [communityMembership, history, vaultAddress]);
}

export function useVaultProperties(
  network: Network | undefined,
  vaultAddress?: string
) {
  let minAccountBorrowSize: TokenBalance | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let vaultName: string | undefined = undefined;

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

      return {
        ...v,
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
