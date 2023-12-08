import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { SparklesIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import {
  FiatSymbols,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { leveragedYield } from '@notional-finance/util';

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
    liquidityYieldData.incentives = liquidityYieldData.incentives.map(
      ({ tokenId, incentiveAPY }) => ({
        tokenId,
        incentiveAPY:
          leveragedYield(incentiveAPY, 0, leverageRatio) || incentiveAPY,
      })
    );
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
          liquidityYieldData?.incentives[0]?.incentiveAPY
            ? liquidityYieldData?.incentives[0]?.incentiveAPY
            : '-',
        Icon: SparklesIcon,
        suffix:
          liquidityYieldData?.incentives &&
          liquidityYieldData?.incentives[0]?.incentiveAPY
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
