import { YieldData } from '@notional-finance/core-entities';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { Network, groupArrayToMap } from '@notional-finance/util';
import {
  Network,
  groupArrayToMap,
  leveragedYield,
} from '@notional-finance/util';

export const useMaxYield = (network: Network | undefined) => {
  const {
    yields: { leveragedLiquidity, liquidity },
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
      if (y !== null) {
        const base = liquidity.find((t) => t.token.id === y.token.id);
        const leverageRatio = (y?.leveraged?.maxLeverageRatio || 1) * 0.8;
        const organicAPY =
          leveragedYield(
            (base?.organicAPY || 0) + (base?.feeAPY || 0),
            y?.leveraged?.debtRate,
            leverageRatio
          ) || 0;
        const noteIncentives =
          leveragedYield(
            base?.noteIncentives?.incentiveAPY,
            0,
            leverageRatio
          ) || 0;
        const secondaryIncentives =
          leveragedYield(
            base?.secondaryIncentives?.incentiveAPY,
            0,
            leverageRatio
          ) || 0;
        const totalAPY = organicAPY + noteIncentives + secondaryIncentives;

        return Object.assign(y, {
          totalAPY,
          organicAPY,
          leveraged: {
            ...y.leveraged,
            leverageRatio,
          },
          noteIncentives: {
            ...y.noteIncentives,
            incentiveAPY: noteIncentives,
          },
          secondaryIncentives: {
            ...y.secondaryIncentives,
            incentiveAPY: secondaryIncentives,
          },
        });
      }
      return y;
    }) as YieldData[];
};
