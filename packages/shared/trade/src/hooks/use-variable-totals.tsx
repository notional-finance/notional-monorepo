import { TradeState, useAppStore } from '@notional-finance/notionable';
import {
  ChartType,
  FiatSymbols,
  TimeSeriesDataPoint,
} from '@notional-finance/core-entities';
import { InfoTooltip } from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  usePrimeCash,
  usePrimeDebt,
  useMaxSupply,
  useChartData,
} from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';

const getSevenDayAvgApy = (apyData: TimeSeriesDataPoint[]) => {
  const seventhToLastNum = apyData.length - 8;
  const lastSevenApys = apyData
    .slice(seventhToLastNum, -1)
    .map((d) => d['totalAPY']);

  const averageApy = lastSevenApys.length
    ? lastSevenApys.reduce((a, b) => a + b) / lastSevenApys.length
    : 0;

  return averageApy;
};

export const useVariableTotals = (state: TradeState) => {
  const theme = useTheme();
  const { deposit } = state;
  const isBorrow = state.tradeType === 'BorrowVariable';
  const { baseCurrency } = useAppStore();
  const maxSupplyData = useMaxSupply(deposit?.network, deposit?.currencyId);
  const { data: apyData } = useChartData(state.debt, ChartType.APY);

  const primeCash = usePrimeCash(deposit?.network, deposit?.currencyId);
  const primeDebt = usePrimeDebt(deposit?.network, deposit?.currencyId);

  const ToolTip = ({ sx }: { sx: SxProps }) => {
    return (
      <InfoTooltip
        sx={{ ...sx }}
        iconSize={theme.spacing(2)}
        iconColor={theme.palette.typography.accent}
        toolTipText={defineMessage({
          defaultMessage:
            'The additional amount that can be deposited before hitting the supply cap.',
        })}
      />
    );
  };

  return [
    {
      title: <FormattedMessage defaultMessage={'Total Lent'} />,
      value: primeCash?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: <FormattedMessage defaultMessage={'Total Borrowed'} />,
      value: primeDebt?.totalSupply?.toFiat(baseCurrency).toFloat() || '-',
      prefix: FiatSymbols[baseCurrency] ? FiatSymbols[baseCurrency] : '$',
      decimals: 0,
    },
    {
      title: isBorrow ? (
        <FormattedMessage defaultMessage={'(7d) Average APY'} />
      ) : (
        <FormattedMessage defaultMessage={'Capacity Remaining'} />
      ),
      Icon: ToolTip,
      value: isBorrow
        ? getSevenDayAvgApy(apyData?.data ?? [])
        : maxSupplyData?.capacityRemaining
        ? maxSupplyData?.capacityRemaining.toFloat()
        : '-',
      suffix: isBorrow ? '%' : deposit?.symbol ? ' ' + deposit?.symbol : '',
      decimals: 2,
    },
  ];
};

export default useVariableTotals;
