import { formatLeverageRatio } from '@notional-finance/helpers';
import {
  useAllMarkets,
  useAllVaults,
  useVaultRiskProfiles,
} from '@notional-finance/notionable-hooks';

export const useVaultCards = () => {
  const listedVaults = useAllVaults();
  const accountVaults = useVaultRiskProfiles();
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets();

  const allVaults = listedVaults.map(
    ({
      vaultAddress,
      minDepositRequired,
      name,
      maxPrimaryBorrowCapacity,
      totalUsedPrimaryBorrowCapacity,
      primaryToken,
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
      const vaultPosition = accountVaults.find(
        (p) => p.vaultAddress === vaultAddress
      );
      const leverage = formatLeverageRatio(
        vaultPosition?.leverageRatio() || y?.leveraged?.leverageRatio || 0,
        1
      );

      return {
        vaultAddress: vaultAddress,
        minDepositRequired,
        underlyingSymbol: primaryToken.symbol,
        hasPosition: !!vaultPosition,
        headlineRate: vaultPosition?.totalAPY || y?.totalAPY,
        netWorth: vaultPosition?.netWorth().toDisplayStringWithSymbol(3, true),
        leverage,
        vaultName: name,
        capacityUsedPercentage,
        capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
      };
    }
  );

  return allVaults;
};
