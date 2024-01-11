import { useEffect } from 'react';
import {
  Registry,
  TokenBalance,
  whitelistedVaults,
} from '@notional-finance/core-entities';
import { useHistory, useLocation } from 'react-router-dom';
import { GATED_VAULTS, BETA_ACCESS } from '@notional-finance/notionable';
import { useNotionalError, useSelectedNetwork } from './use-notional';

export function useVaultNftCheck(hasContestNFT?: BETA_ACCESS) {
  const history = useHistory();
  const { pathname } = useLocation();
  const vaultAddress = pathname.split('/')[2];

  useEffect(() => {
    if (
      vaultAddress &&
      GATED_VAULTS.includes(vaultAddress) &&
      hasContestNFT !== BETA_ACCESS.CONFIRMED
    ) {
      history.push('/vaults');
    }
  }, [hasContestNFT, history, vaultAddress]);
}

export function useVaultProperties(vaultAddress?: string) {
  let minAccountBorrowSize: TokenBalance | undefined = undefined;
  let minDepositRequired: string | undefined = undefined;
  let strategyName = '';
  let vaultName: string | undefined = undefined;

  const network = useSelectedNetwork();
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
      strategyName = 'SingleSidedLP';

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
    strategyName,
    minDepositRequired,
  };
}

export function useAllVaults() {
  const network = useSelectedNetwork();
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
