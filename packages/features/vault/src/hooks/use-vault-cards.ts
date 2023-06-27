import { useAllVaults } from '@notional-finance/notionable-hooks';

export const useVaultCards = () => {
  const listedVaults = useAllVaults();
  const allVaults = listedVaults.map(
    ({
      vaultAddress,
      minDepositRequired,
      name,
      maxPrimaryBorrowCapacity,
      totalUsedPrimaryBorrowCapacity,
      primaryToken,
    }) => {
      const headlineRate = 0;
      const capacityRemaining = maxPrimaryBorrowCapacity.sub(
        totalUsedPrimaryBorrowCapacity
      );
      const capacityUsedPercentage = totalUsedPrimaryBorrowCapacity
        .scale(100, maxPrimaryBorrowCapacity)
        .toNumber();

      return {
        vaultAddress: vaultAddress,
        minDepositRequired,
        underlyingSymbol: primaryToken.symbol,
        headlineRate,
        vaultName: name,
        capacityUsedPercentage,
        capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
      };
    }
  );

  return allVaults;
};
