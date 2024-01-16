import {
  FiatSymbols,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { SparklesIcon } from '@notional-finance/icons';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTotalsData = (
  tokenSymbol: string,
  nTokenAmount?: TokenBalance
) => {
  const { yields } = useAllMarkets();
  const baseCurrency = useFiat();

  const liquidityYieldData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(
        ({ underlying }) => underlying.symbol === tokenSymbol
      );

  const totalIncentives =
    (liquidityYieldData?.noteIncentives?.incentiveAPY || 0) +
    (liquidityYieldData?.secondaryIncentives?.incentiveAPY || 0);

  return {
    totalsData: [
      {
        title: <FormattedMessage defaultMessage={'TVL'} />,
        value: liquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      },
      {
        title: <FormattedMessage defaultMessage={'Incentive APY'} />,
        value: totalIncentives ? totalIncentives : '-',
        Icon: SparklesIcon,
        suffix: totalIncentives ? '%' : '',
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
