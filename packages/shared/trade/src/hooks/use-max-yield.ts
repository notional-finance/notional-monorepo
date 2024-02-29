import { YieldData } from '@notional-finance/core-entities';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { Network, groupArrayToMap } from '@notional-finance/util';

export const useMaxYield = (network: Network | undefined) => {
  const {
    yields: { leveragedLiquidity },
    getMax,
  } = useAllMarkets(network);

  return [
    ...groupArrayToMap(
      leveragedLiquidity,
      (t) => t.underlying.symbol
    ).entries(),
  ]
    .map(([, data]) => getMax(data))
    .map((y) => {
      return {
        ...y,
      };
    }) as YieldData[];
};
