import Market from '@notional-finance/sdk/src/system/Market';
import { useAllVaults } from '@notional-finance/notionable-hooks';

interface MaxVaultRateData {
  symbol: string;
  maxRate: string;
}

interface VaultMaxRate {
  maxVaultRateData: MaxVaultRateData;
  vaultDataloading: boolean;
}

export const useVaultMaxRate = (): VaultMaxRate => {
  const listedVaults = useAllVaults();
  let currentRate = 0;
  let maxVaultRateData = {
    symbol: 'eth',
    maxRate: '0%',
  };

  listedVaults.forEach(({ primaryToken }) => {
    const headlineRate = 0;
    if (headlineRate > currentRate) {
      currentRate = headlineRate;
      maxVaultRateData = {
        symbol: primaryToken.symbol,
        maxRate: Market.formatInterestRate(headlineRate, 2),
      };
    }
  });

  return { maxVaultRateData, vaultDataloading: listedVaults.length === 0 };
};
