import { headlineApy$, initialVaultState, vaultState$ } from '@notional-finance/notionable';
import { getMinDepositRequiredString } from '@notional-finance/notionable-hooks';

import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useObservableState } from 'observable-hooks';

export const useStrategies = () => {
  const { listedVaults } = useObservableState(vaultState$, initialVaultState);
  const headlineApy = useObservableState(headlineApy$);
  const allVaults = listedVaults.map(({ vaultConfig, underlyingSymbol, strategyName }) => {
    const headlineRate = headlineApy?.get(vaultConfig.vaultAddress) || 0;
    const capacityUsedPercentage =
      (vaultConfig.totalUsedPrimaryBorrowCapacity
        .scale(RATE_PRECISION, vaultConfig.maxPrimaryBorrowCapacity)
        .toNumber() *
        100) /
      RATE_PRECISION;
    const minDepositRequired = getMinDepositRequiredString(vaultConfig);

    return {
      vaultAddress: vaultConfig.vaultAddress,
      minDepositRequired,
      underlyingSymbol,
      headlineRate,
      strategyName,
      capacityUsedPercentage,
    };
  });

  return allVaults;
};
