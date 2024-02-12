import { TokenDefinition } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import {
  useTokenHistory,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { BarConfigProps } from '@notional-finance/mui';

export const useApyChart = (token?: TokenDefinition) => {
  const { apyIncentiveData } = useTokenHistory(token);
  const themeVariant = useThemeVariant();
  const theme = useTheme();

  let barChartData = apyIncentiveData?.map(
    ({ arbApy, noteApy, organicApy, timestamp }) => {
      return {
        arbApy: arbApy,
        noteApy: noteApy,
        organicApy: organicApy,
        timestamp,
      };
    }
  );

  if (barChartData.length > 50) {
    barChartData = barChartData.slice(barChartData.length - 50);
  }

  const barConfig: BarConfigProps[] = [
    {
      dataKey: 'organicApy',
      title: <FormattedMessage defaultMessage="ORGANIC APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="ORGANIC APY" />,
      fill: theme.palette.background.accentDefault,
      value: '0',
    },
    {
      dataKey: 'arbApy',
      title: <FormattedMessage defaultMessage="ARB APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="ARB APY" />,
      fill:
        themeVariant === THEME_VARIANTS.LIGHT
          ? colors.greenGrey
          : colors.darkGrey,
      value: '0',
    },
    {
      dataKey: 'noteApy',
      title: <FormattedMessage defaultMessage="NOTE APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="NOTE APY" />,
      fill: theme.palette.primary.light,
      radius: [8, 8, 0, 0],
      value: '0',
    },
  ];

  return { barConfig, barChartData };
};

export default useApyChart;
