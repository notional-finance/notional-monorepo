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
import { useMemo } from 'react';

export const useTotalsChart = (
  baseCurrency: FiatKeys,
  tickSize: number,
  range: number | undefined
) => {
  const { themeVariant, isMobileView } = useAppStore();
  const network = useSelectedNetwork();
  const currentFactors = useAccountCurrentFactors(network);

  const historyData = useAccountHistoryChart(
    network,
    range ? getNowSeconds() - range : undefined,
    getNowSeconds(),
    tickSize
  );

  // Memoize barChartData to prevent recalculation on each render
  const barChartData = useMemo(() => {
    return historyData?.map(({ assets, debts, netWorth, timestamp }) => {
      return {
        totalAssets: assets.toFloat(),
        totalDebts: debts.toFloat(),
        totalNetWorth: netWorth.toFloat(),
        timestamp,
      };
    });
  }, [historyData]);

  // Memoize barConfig to prevent recreation on every render
  const barConfig = useMemo(() => {
    const config: BarConfigProps[] = [
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
        value:
          currentFactors?.netWorth?.toDisplayStringWithSymbol(2, true, false) ??
          '0',
      },
    ];

    if (currentFactors?.debts?.isNegative() && !isMobileView) {
      config.push(
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
          value:
            currentFactors?.assets?.toDisplayStringWithSymbol(2, true, false) ??
            '0',
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
          value:
            currentFactors?.debts
              ?.abs()
              .toDisplayStringWithSymbol(2, true, false) ?? '0',
        }
      );
    }

    if (currentFactors?.currentAPY) {
      config.push({
        dataKey: 'currentApy',
        title: <FormattedMessage defaultMessage="Current APY" />,
        toolTipTitle: <FormattedMessage defaultMessage="Current APY" />,
        fill: 'transparent',
        radius: [8, 8, 0, 0],
        currencySymbol: FiatSymbols[baseCurrency]
          ? FiatSymbols[baseCurrency]
          : '$',
        value: formatNumberAsPercent(currentFactors?.currentAPY),
      });
    }

    return config;
  }, [currentFactors, themeVariant, isMobileView, baseCurrency]);

  // Memoize hasData computation
  const hasData = useMemo(() => {
    return (
      historyData?.find(({ netWorth }) => netWorth.toFloat() > 0) &&
      currentFactors
    );
  }, [historyData, currentFactors]);

  // Memoize totalsData to prevent recalculation
  const totalsData = useMemo(() => {
    return barConfig.map((data) => {
      return {
        title: data.title,
        fill: data.fill,
        value: data.value,
        dataKey: data.dataKey,
      };
    }) as ChartHeaderTotalsDataProps[];
  }, [barConfig]);

  // Memoize the return value to prevent object recreation
  return useMemo(() => {
    return {
      barChartData: hasData ? barChartData : undefined,
      barConfig: hasData ? barConfig : undefined,
      totalsData: hasData ? totalsData : undefined,
    };
  }, [hasData, barChartData, barConfig, totalsData]);
};

export default { useTotalsChart };
