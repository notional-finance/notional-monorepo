import {
  useAccountHistoryChart,
  useSelectedNetwork,
  useAccountCurrentFactors,
} from '@notional-finance/notionable-hooks';
import { FiatKeys, FiatSymbols } from '@notional-finance/core-entities';
import {} from '@notional-finance/notionable-hooks';
import { useAppStore } from '@notional-finance/notionable-hooks';
import {
  BarConfigProps,
  ChartHeaderTotalsDataProps,
} from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { THEME_VARIANTS, getNowSeconds } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

export const useTotalsChart = (
  baseCurrency: FiatKeys,
  tickSize: number,
  range: number
) => {
  const { themeVariant, isMobileView } = useAppStore();
  const network = useSelectedNetwork();
  const { currentAPY, netWorth, debts, assets } =
    useAccountCurrentFactors(network);

  const historyData = useAccountHistoryChart(
    network,
    getNowSeconds() - range,
    getNowSeconds(),
    tickSize
  );

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

  const barConfig: BarConfigProps[] = [
    {
      dataKey: 'totalNetWorth',
      title: <FormattedMessage defaultMessage="Total Net Worth" />,
      toolTipTitle: <FormattedMessage defaultMessage="Net Worth" />,
      fill:
        themeVariant === THEME_VARIANTS.LIGHT
          ? colors.turquoise
          : colors.neonTurquoise,
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: netWorth?.toDisplayStringWithSymbol(2, true, false) ?? '0',
    },
  ];

  if (debts?.isNegative() && !isMobileView) {
    barConfig.push(
      {
        dataKey: 'totalAssets',
        title: <FormattedMessage defaultMessage="Total Assets" />,
        toolTipTitle: <FormattedMessage defaultMessage="Assets" />,
        fill:
          themeVariant === THEME_VARIANTS.LIGHT
            ? colors.matteGreen
            : colors.lightGrey,
        radius: [8, 8, 0, 0],
        currencySymbol: FiatSymbols[baseCurrency]
          ? FiatSymbols[baseCurrency]
          : '$',
        value: assets?.toDisplayStringWithSymbol(2, true, false) ?? '0',
      },
      {
        dataKey: 'totalDebts',
        title: <FormattedMessage defaultMessage="Total Debts" />,
        toolTipTitle: <FormattedMessage defaultMessage="Debts" />,
        fill:
          themeVariant === THEME_VARIANTS.LIGHT
            ? colors.purple
            : colors.blueAccent,
        radius: [8, 8, 0, 0],
        currencySymbol: FiatSymbols[baseCurrency]
          ? FiatSymbols[baseCurrency]
          : '$',
        value: debts?.abs().toDisplayStringWithSymbol(2, true, false) ?? '0',
      }
    );
  }

  if (currentAPY) {
    barConfig.push({
      dataKey: 'currentApy',
      title: <FormattedMessage defaultMessage="Current APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="Current APY" />,
      fill: 'transparent',
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: formatNumberAsPercent(currentAPY),
    });
  }

  const hasData = historyData?.find(({ netWorth }) => netWorth.toFloat() > 0);

  const totalsData = barConfig.map((data) => {
    return {
      title: data.title,
      fill: data.fill,
      value: data.value,
      dataKey: data.dataKey,
    };
  }) as ChartHeaderTotalsDataProps[];

  return {
    barChartData: hasData ? barChartData : [],
    barConfig,
    totalsData,
  };
};

export default { useTotalsChart };
