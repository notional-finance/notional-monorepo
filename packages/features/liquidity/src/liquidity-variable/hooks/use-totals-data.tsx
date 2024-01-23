import {
  FiatSymbols,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { SparklesIcon } from '@notional-finance/icons';
import {
  useAllMarkets,
  useFiat,
  useTotalHolders,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTotalsData = (
  deposit: TokenDefinition | undefined,
  nToken: TokenDefinition | undefined,
  nTokenAmount?: TokenBalance
) => {
  const { yields } = useAllMarkets(deposit?.network);
  const baseCurrency = useFiat();
  const totalLPs = useTotalHolders(nToken);

  const liquidityYieldData = nTokenAmount
    ? Registry.getYieldRegistry().getSimulatedNTokenYield(nTokenAmount)
    : yields.liquidity.find(({ underlying }) => underlying.id === deposit?.id);

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
        value: totalLPs ? `${totalLPs}` : '-',
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
