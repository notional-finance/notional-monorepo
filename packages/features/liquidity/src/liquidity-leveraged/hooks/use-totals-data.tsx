import { YieldData, FiatSymbols } from '@notional-finance/core-entities';
import { TradeState } from '@notional-finance/notionable';
import { SparklesIcon } from '@notional-finance/icons';
import { useMaxSupply, useFiat } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTotalsData = (
  state: TradeState,
  liquidityYieldData: YieldData | undefined
) => {
  const { deposit } = state;
  const baseCurrency = useFiat();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  let totalIncentives = 0;

  if (
    liquidityYieldData &&
    liquidityYieldData?.noteIncentives &&
    liquidityYieldData?.secondaryIncentives
  ) {
    totalIncentives =
      liquidityYieldData?.noteIncentives?.incentiveAPY +
      liquidityYieldData?.secondaryIncentives?.incentiveAPY;
  } else if (liquidityYieldData && liquidityYieldData?.noteIncentives) {
    totalIncentives = liquidityYieldData?.noteIncentives?.incentiveAPY;
  }

  return {
    totalsData: [
      {
        title: <FormattedMessage defaultMessage={'TVL'} />,
        value: liquidityYieldData?.tvl?.toFiat(baseCurrency).toFloat() || '-',
        prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      },
      {
        title: <FormattedMessage defaultMessage={'Total Incentive APY'} />,
        value: totalIncentives > 0 ? totalIncentives : '-',
        Icon: SparklesIcon,
        suffix: totalIncentives ? '%' : '',
      },
      {
        title: <FormattedMessage defaultMessage={'Capacity Remaining'} />,
        value: maxSupplyData?.capacityRemaining
          ? maxSupplyData?.capacityRemaining.toFloat()
          : '-',
        suffix: deposit?.symbol ? ' ' + deposit?.symbol : '',
      },
    ],
    liquidityYieldData,
  };
};

export default useTotalsData;
