import { TokenDefinition } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import { useTokenHistory } from '@notional-finance/notionable-hooks';
import { BarConfigProps } from '@notional-finance/mui';
import { useMemo } from 'react';
import { useAppState } from '@notional-finance/notionable';

export const useApyChart = (token?: TokenDefinition, defaultDataLimit = 50) => {
  let { apyData } = useTokenHistory(token);
  const { themeVariant } = useAppState();
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

  if (apyData.length > defaultDataLimit) {
    apyData = apyData.slice(apyData.length - defaultDataLimit);
  }

  const barConfig: BarConfigProps[] = apyData.length
    ? Object.keys(apyData[0])
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
