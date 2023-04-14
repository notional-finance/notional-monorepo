import {
  headlineApy$,
  initialVaultState,
  vaultState$,
} from '@notional-finance/notionable';
import { useObservableState } from 'observable-hooks';
import Market from '@notional-finance/sdk/src/system/Market';

interface MaxVaultRateData {
  symbol: string;
  maxRate: string;
}

export const useVaultMaxRate = (): MaxVaultRateData => {
  const { listedVaults } = useObservableState(vaultState$, initialVaultState);
  const headlineApy = useObservableState(headlineApy$);
  let currentRate = 0;
  let maxVaultRateData = {
    symbol: 'ETH',
    maxRate: '0%',
  };

  listedVaults.forEach(({ vaultConfig, underlyingSymbol }) => {
    const headlineRate = headlineApy?.get(vaultConfig.vaultAddress) || 0;
    if (headlineRate > currentRate) {
      currentRate = headlineRate;
      maxVaultRateData = {
        symbol: underlyingSymbol,
        maxRate: Market.formatInterestRate(headlineRate, 2),
      };
    }
  });

  return maxVaultRateData;
};
