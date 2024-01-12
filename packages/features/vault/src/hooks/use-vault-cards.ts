import { formatLeverageRatio } from '@notional-finance/helpers';
import { VaultCardOverlay } from '../components';
import {
  useAllMarkets,
  useAllVaults,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { GATED_VAULTS } from '@notional-finance/notionable';
import { DegenScoreIcon } from '@notional-finance/icons';
import { Network } from '@notional-finance/util';

interface AllVaultsProps {
  capacityRemaining: string;
  capacityUsedPercentage: number;
  hasPosition: boolean;
  headlineRate: number;
  leverage: string;
  minDepositRequired: string;
  netWorth?: string;
  underlyingSymbol: string;
  vaultAddress: string;
  vaultName: string;
  VaultCardOverlay?: any;
  VaultCardIcon?: any;
  accessGroup?: string;
}

export const useVaultCards = (network: Network) => {
  const listedVaults = useAllVaults(network);
  const vaultHoldings = useVaultHoldings(network);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);

  const allVaults = listedVaults.map(
    ({
      vaultAddress,
      minDepositRequired,
      name,
      maxPrimaryBorrowCapacity,
      totalUsedPrimaryBorrowCapacity,
      primaryToken,
      id,
    }) => {
      const y = getMax(
        leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
      );
      const capacityRemaining = maxPrimaryBorrowCapacity.sub(
        totalUsedPrimaryBorrowCapacity
      );
      const capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
        .scale(100, maxPrimaryBorrowCapacity)
        .toNumber();
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vaultAddress
      )?.vault;
      const leverage = formatLeverageRatio(
        profile?.leverageRatio() || y?.leveraged?.leverageRatio || 0,
        1
      );

      return {
        vaultAddress: vaultAddress,
        minDepositRequired,
        underlyingSymbol: primaryToken.symbol,
        hasPosition: !!profile,
        headlineRate: profile?.totalAPY || y?.totalAPY,
        netWorth: profile?.netWorth().toDisplayStringWithSymbol(3, true),
        leverage,
        vaultName: name,
        capacityUsedPercentage,
        capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
        VaultCardOverlay:
          GATED_VAULTS[id].length > 0 ? VaultCardOverlay : undefined,
        VaultCardIcon: GATED_VAULTS[id].length > 0 ? DegenScoreIcon : undefined,
      };
    }
  );

  return allVaults as AllVaultsProps[];
};
