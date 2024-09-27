import { useEffect } from 'react';
import {
  Registry,
  TokenBalance,
  whitelistedVaults,
  getVaultType,
} from '@notional-finance/core-entities';
import { useLocation, useNavigate } from 'react-router-dom';
import { GATED_VAULTS } from '@notional-finance/notionable';
import { useNotionalError } from './use-notional';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useWalletCommunities } from './use-wallet';
import { useAllMarkets } from './use-market';

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

export function useAllVaults(
  network: Network | undefined,
  vaultProduct?: PRODUCTS
) {
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(network);

  if (!network) return [];

  const config = Registry.getConfigurationRegistry();
  const listedVaults =
    config
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
        const vaultTVL = Registry.getVaultRegistry()
          .getVaultAdapter(network, v.vaultAddress)
          .getVaultTVL();
        const maxVaultAPY = getMax(
          leveragedVaults.filter((z) => z.token.vaultAddress === v.vaultAddress)
        );
        const vaultType = getVaultType(v.vaultAddress, network);

        return {
          ...v,
          vaultType,
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
          maxVaultAPY,
        };
      }) || [];

  if (vaultProduct) {
    return listedVaults.filter((v) => {
      switch (vaultProduct) {
        case PRODUCTS.LEVERAGED_PENDLE:
          return v.vaultType === 'PendlePT';
        case PRODUCTS.LEVERAGED_POINTS_FARMING:
          return (
            v.vaultType.startsWith('SingleSidedLP') &&
            v.maxVaultAPY &&
            v.maxVaultAPY.pointMultiples !== undefined
          );
        case PRODUCTS.LEVERAGED_YIELD_FARMING:
          return (
            v.vaultType.startsWith('SingleSidedLP') &&
            v.maxVaultAPY &&
            v.maxVaultAPY.pointMultiples === undefined
          );
        default:
          return false;
      }
    });
  }

  return listedVaults;
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
