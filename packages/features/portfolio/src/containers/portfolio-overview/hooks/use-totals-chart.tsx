import { useState } from 'react';
import { useAccountHistoryChart } from '@notional-finance/notionable-hooks';
import { FiatSymbols } from '@notional-finance/core-entities';
import {
  useAccountCurrentFactors,
  useFiat,
} from '@notional-finance/notionable-hooks';
import {
  useWindowDimensions,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import {
  THEME_VARIANTS,
  SECONDS_IN_MONTH,
  SECONDS_IN_DAY,
  getNowSeconds,
} from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import { useThemeVariant } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export const useTotalsChart = () => {
  const baseCurrency = useFiat();
  const windowDimensions = useWindowDimensions();
  const { currentAPY, netWorth, debts, assets } = useAccountCurrentFactors();
  const [secondsMultiple, setSecondsMultiple] = useState(1.5);

  if (windowDimensions.width <= 1152 && secondsMultiple !== 1.2) {
    setSecondsMultiple(1.2);
  }
  if (windowDimensions.width > 1200 && secondsMultiple !== 1.5) {
    setSecondsMultiple(1.5);
  }

  const historyData = useAccountHistoryChart(
    getNowSeconds() - SECONDS_IN_MONTH * secondsMultiple,
    getNowSeconds(),
    SECONDS_IN_DAY * 3
  );
  const themeVariant = useThemeVariant();

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
      value: netWorth.toDisplayStringWithSymbol(0),
    },
  ];

  if (debts.isNegative()) {
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
        value: assets.toDisplayStringWithSymbol(0),
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
        value: debts.abs().toDisplayStringWithSymbol(0),
      }
    );
  }

  if (currentAPY) {
    barConfig.push({
      dataKey: 'currentApy',
      title: <FormattedMessage defaultMessage="Current APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="Debts" />,
      fill: 'transparent',
      radius: [8, 8, 0, 0],
      currencySymbol: FiatSymbols[baseCurrency]
        ? FiatSymbols[baseCurrency]
        : '$',
      value: formatNumberAsPercent(currentAPY),
    });
  }

  const hasData = historyData?.find(({ netWorth }) => netWorth.toFloat() > 0);

  return {
    barChartData: hasData ? barChartData : [],
    barConfig,
  };
};

export default useTotalsChart;
