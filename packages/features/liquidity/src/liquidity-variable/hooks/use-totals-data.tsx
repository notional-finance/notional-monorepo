import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { SparklesIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import {
  FiatSymbols,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';

export const useTotalsData = (
  tokenSymbol: string,
  nTokenAmount?: TokenBalance
) => {
  const { yields } = useAllMarkets();
  const baseCurrency = useFiat();

  const liquidityData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(
        ({ underlying }) => underlying.symbol === tokenSymbol
      );

  if (liquidityData?.incentives && liquidityData?.incentives[0]?.incentiveAPY) {
    console.log(
      'liquidityData?.incentives[0]?.incentiveAPY: ',
      liquidityData?.incentives[0]?.incentiveAPY
    );
  }

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value: liquidityData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
    },
    {
      title: <FormattedMessage defaultMessage={'Incentive APY'} />,
      value:
        liquidityData?.incentives && liquidityData?.incentives[0]?.incentiveAPY
          ? liquidityData?.incentives[0]?.incentiveAPY
          : '-',
      Icon: SparklesIcon,
      suffix:
        liquidityData?.incentives && liquidityData?.incentives[0]?.incentiveAPY
          ? '%'
          : '',
    },
    {
      title: <FormattedMessage defaultMessage={'Liquidity Providers'} />,
      value: '-',
    },
  ];
};

export default useTotalsData;
