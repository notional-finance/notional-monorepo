import { useTheme } from '@mui/material';
import { useAccountHistoryChart } from '@notional-finance/notionable-hooks';
import { FiatSymbols } from '@notional-finance/core-entities';
import { useFiat } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTotalsChart = () => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const historyData = useAccountHistoryChart();

  console.log('historyData', historyData);

  const barChartData = historyData?.map(
    ({ assets, debts, netWorth, timestamp }) => {
      return {
        totalAssets: assets.toFloat(),
        totalDebts: debts.toFloat(),
        totalNetWorth: netWorth.toFloat(),
        timestamp,
      };
    }
  );

  const barConfig = [
    {
      dataKey: 'totalNetWorth',
      title: (
        <FormattedMessage
          defaultMessage="Total Net Worth {baseCurrency}"
          values={{
            baseCurrency,
          }}
        />
      ),
      fill: theme.palette.primary.light,
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: '$658,000',
      percentChange: '0.05%',
    },
    {
      dataKey: 'totalAssets',
      title: (
        <FormattedMessage
          defaultMessage="Total Assets {baseCurrency}"
          values={{
            baseCurrency,
          }}
        />
      ),
      fill: theme.palette.primary.dark,
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: '$832,000',
      percentChange: '0.05%',
    },
    {
      dataKey: 'totalDebts',
      title: (
        <FormattedMessage
          defaultMessage="Total Debts {baseCurrency}"
          values={{
            baseCurrency,
          }}
        />
      ),
      fill: '#C5B6DD',
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: '$174,000',
      percentChange: '-0.05%',
    },
  ];

  return { barChartData, barConfig };
};

export default useTotalsChart;
