import {
  useAllVaults,
  useVaultHoldings,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { DashboardDataProps } from '@notional-finance/mui';
import { Network } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useVaultCards = (network: Network) => {
  const listedVaults = useAllVaults(network);
  const vaultHoldings = useVaultHoldings(network);
  const {
    yields: { leveragedVaults },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);


  const vaultDashBoardData = listedVaults.map(
    ({
      vaultAddress,
      name,
      primaryToken,
    }) => {
      const y = getMax(
        leveragedVaults.filter((y) => y.token.vaultAddress === vaultAddress)
      );
      
      const profile = vaultHoldings.find(
        (p) => p.vault.vaultAddress === vaultAddress
      )?.vault;

      const apy = profile?.totalAPY || y?.totalAPY || undefined;

      return {
        symbol: primaryToken.symbol,
        // hasPosition: !!profile,
        tvl: 'TVL: $100K',
        apy: apy ? formatNumberAsPercent(apy) : undefined,
        title: name,
        incentiveSymbol: 'ARB',
        incentiveValue: '12.40%',
        organicApyOnly: false,
      };
    }
  )

  return vaultDashBoardData as DashboardDataProps[];
};
