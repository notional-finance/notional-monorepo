import { TokenDefinition } from '@notional-finance/core-entities';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { leveragedYield } from '@notional-finance/util';

export const useMaxYield = (deposit?: TokenDefinition) => {
  const {
    yields: { leveragedLiquidity },
    getMax,
  } = useAllMarkets();

  const maxData = getMax(
    leveragedLiquidity.filter(
      ({ token }) => token.currencyId === deposit?.currencyId
    )
  );
  return leveragedYield(
    maxData?.strategyAPY,
    maxData?.leveraged?.debtRate,
    maxData?.leveraged?.maxLeverageRatio
  );
};
