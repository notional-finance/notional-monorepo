import {
  FiatSymbols,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { SparklesIcon } from '@notional-finance/icons';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { leveragedYield } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useTotalsData = (
  tokenSymbol: string,
  nTokenAmount?: TokenBalance,
  debtAPY?: number,
  leverageRatio?: number
) => {
  const { yields } = useAllMarkets();
  const baseCurrency = useFiat();

  const liquidityYieldData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(
        ({ underlying }) => underlying.symbol === tokenSymbol
      );

  if (
    leverageRatio &&
    debtAPY &&
    liquidityYieldData?.interestAPY !== undefined
  ) {
    // If using leverage apply the debt APY to the interest apy
    liquidityYieldData.interestAPY = leveragedYield(
      liquidityYieldData.interestAPY,
      debtAPY,
      leverageRatio
    );
  }

  if (leverageRatio && !!liquidityYieldData?.incentives) {
    // If using leverage apply the
    liquidityYieldData.incentives.incentiveAPY =
      leveragedYield(
        liquidityYieldData.incentives.incentiveAPY,
        0,
        leverageRatio
      ) || liquidityYieldData.incentives.incentiveAPY;
  }

  return {
    totalsData: [
      {
        title: <FormattedMessage defaultMessage={'TVL'} />,
        value: liquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      },
      {
        title: <FormattedMessage defaultMessage={'Incentive APY'} />,
        value:
          liquidityYieldData?.incentives &&
          liquidityYieldData?.incentives?.incentiveAPY
            ? liquidityYieldData?.incentives?.incentiveAPY
            : '-',
        Icon: SparklesIcon,
        suffix:
          liquidityYieldData?.incentives &&
          liquidityYieldData?.incentives?.incentiveAPY
            ? '%'
            : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Liquidity Providers'} />,
        value: '-',
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
