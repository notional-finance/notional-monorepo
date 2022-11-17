import {
  headlineApy$,
  initialVaultState,
  vaultState$,
} from '@notional-finance/notionable';
import { getMinDepositRequiredString } from '@notional-finance/notionable-hooks';

import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useObservableState } from 'observable-hooks';

export const useStrategies = () => {
  const { listedVaults } = useObservableState(vaultState$, initialVaultState);
  const headlineApy = useObservableState(headlineApy$);
  const allVaults = listedVaults.map(({ vaultConfig, underlyingSymbol }) => {
    const headlineRate = headlineApy?.get(vaultConfig.vaultAddress) || 0;
    const capacityUsedPercentage =
      (vaultConfig.totalUsedPrimaryBorrowCapacity
        .scale(RATE_PRECISION, vaultConfig.maxPrimaryBorrowCapacity)
        .toNumber() *
        100) /
      RATE_PRECISION;
    const minDepositRequired = getMinDepositRequiredString(vaultConfig);
    const capacityRemaining = vaultConfig.maxPrimaryBorrowCapacity.sub(
      vaultConfig.totalUsedPrimaryBorrowCapacity
    );

    return {
      vaultAddress: vaultConfig.vaultAddress,
      minDepositRequired,
      underlyingSymbol,
      headlineRate,
      vaultName: vaultConfig.name,
      capacityUsedPercentage,
      capacityRemaining: capacityRemaining.toDisplayStringWithSymbol(0),
    };
  });

  return allVaults;
};
