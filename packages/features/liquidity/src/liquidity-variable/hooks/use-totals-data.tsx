import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { SparklesIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Registry, TokenBalance } from '@notional-finance/core-entities';

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

  return [
    {
      title: <FormattedMessage defaultMessage={'TVL'} />,
      value:
        liquidityData?.tvl?.toFiat(baseCurrency).toDisplayStringWithSymbol() ||
        '-',
    },
    {
      title: <FormattedMessage defaultMessage={'Incentive APY'} />,
      value:
        liquidityData?.incentives && liquidityData?.incentives[0]?.incentiveAPY
          ? formatNumberAsPercent(liquidityData?.incentives[0]?.incentiveAPY)
          : '-',
      Icon: SparklesIcon,
    },
    {
      title: <FormattedMessage defaultMessage={'Liquidity Providers'} />,
      value: '-',
    },
  ];
};

export default useTotalsData;
