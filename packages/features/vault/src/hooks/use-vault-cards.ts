import {
  useAllMarkets,
  useAllVaults,
} from '@notional-finance/notionable-hooks';

export const useVaultCards = () => {
  const listedVaults = useAllVaults();
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

      return {
        vaultAddress: vaultAddress,
        minDepositRequired,
        underlyingSymbol: primaryToken.symbol,
        headlineRate: y?.totalAPY,
        leverage: `${y?.leveraged?.leverageRatio.toFixed(1)}x`,
        vaultName: name,
        capacityUsedPercentage,
        capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
      };
    }
  );

  return allVaults;
};
