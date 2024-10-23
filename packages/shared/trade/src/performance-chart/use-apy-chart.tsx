import { ChartType, TokenDefinition } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import { useChartData } from '@notional-finance/notionable-hooks';
import { BarConfigProps } from '@notional-finance/mui';
import { useMemo } from 'react';
import { useAppStore } from '@notional-finance/notionable';

export const useApyChart = (token?: TokenDefinition) => {
  const { data: apyData } = useChartData(token, ChartType.APY);
  const { themeVariant } = useAppStore();
  const BarColors = useMemo(
    () =>
      ({
        [THEME_VARIANTS.LIGHT]: [
          colors.black,
          colors.greenGrey,
          colors.aqua,
          colors.blueAccent,
        ],
        [THEME_VARIANTS.DARK]: [
          colors.white,
          colors.darkGrey,
          colors.neonTurquoise,
          colors.blueAccent,
        ],
      }[themeVariant]),
    [themeVariant]
  );

  const barConfig: BarConfigProps[] =
    apyData && apyData.data.length
      ? Object.keys(apyData.data[0])
          .filter(
            (k) =>
              k !== 'timestamp' &&
              k !== 'area' &&
              k !== 'totalAPY' &&
              k !== 'Total Strategy APY'
          )
          .map((k, i) => {
            return {
              dataKey: k,
              title: k,
              toolTipTitle: k,
              fill: BarColors[i % BarColors.length],
              value: '0',
            };
          })
      : [];

  return { barConfig, barChartData: apyData };
};

export default useApyChart;
