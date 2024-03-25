import { TokenDefinition } from '@notional-finance/core-entities';
import { Network, THEME_VARIANTS } from '@notional-finance/util';
import { colors } from '@notional-finance/styles';
import {
  useTokenHistory,
  useThemeVariant,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { BarConfigProps } from '@notional-finance/mui';

export const useApyChart = (token?: TokenDefinition, defaultDataLimit = 50) => {
  const { apyIncentiveData } = useTokenHistory(token);
  const selectedNetwork = useSelectedNetwork();
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

  if (barChartData.length > defaultDataLimit) {
    barChartData = barChartData.slice(barChartData.length - defaultDataLimit);
  }
  const hasNOTEIncentives = !!barChartData.find(
    ({ noteApy }) => noteApy !== undefined
  );
  const hasARBIncentives = !!barChartData.find(
    ({ arbApy }) => arbApy !== undefined
  );
  const hasIncentives = hasARBIncentives || hasNOTEIncentives;

  const barConfig: BarConfigProps[] = [
    {
      dataKey: 'organicApy',
      title: hasIncentives ? (
        <FormattedMessage defaultMessage="ORGANIC APY" />
      ) : (
        <FormattedMessage defaultMessage="TOTAL APY" />
      ),
      toolTipTitle: hasIncentives ? (
        <FormattedMessage defaultMessage="ORGANIC APY" />
      ) : (
        <FormattedMessage defaultMessage="TOTAL APY" />
      ),
      fill: hasIncentives
        ? theme.palette.background.accentDefault
        : theme.palette.charts.main,
      value: '0',
    },
  ];

  if (hasARBIncentives) {
    barConfig.push({
      dataKey: 'arbApy',
      title: <FormattedMessage defaultMessage="ARB APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="ARB APY" />,
      fill:
        selectedNetwork === Network.arbitrum
          ? theme.palette.background.accentDefault
          : theme.palette.charts.main,
      value: '0',
    });
  }
  if (hasNOTEIncentives) {
    barConfig.push({
      dataKey: 'noteApy',
      title: <FormattedMessage defaultMessage="NOTE APY" />,
      toolTipTitle: <FormattedMessage defaultMessage="NOTE APY" />,
      fill: theme.palette.primary.light,
      radius: [8, 8, 0, 0],
      value: '0',
    });
  }

  if (selectedNetwork === Network.arbitrum) {
    barConfig.push(
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
      }
    );
  }

  return { barConfig, barChartData };
};

export default useApyChart;
