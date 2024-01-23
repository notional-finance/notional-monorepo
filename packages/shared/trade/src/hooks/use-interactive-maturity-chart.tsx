import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  ChartToolTipDataProps,
  LEGEND_LINE_TYPES,
} from '@notional-finance/mui';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { getDateString } from '@notional-finance/util';
import { TokenDefinition } from '@notional-finance/core-entities';

export const useInteractiveMaturityChart = (token: TokenDefinition | undefined) => {
  const theme = useTheme();
  const fCashMarket = useFCashMarket(token);
  let areaChartData: any[] = [];

  if (fCashMarket) {
    const {
      poolParams: { perMarketfCash },
    } = fCashMarket;

    areaChartData = perMarketfCash.map((data) => {
      const interestRate = fCashMarket.getSpotInterestRate(data.token);
      return {
        timestamp: data.maturity,
        area: interestRate,
        marketKey: data.tokenId,
      };
    });
  }

  const chartHeaderData = {
    textHeader: <FormattedMessage defaultMessage={'APY by Maturity'} />,
  };

  const apyToolTipData: ChartToolTipDataProps = {
    timestamp: {
      formatTitle: (timestamp: any) => (
        <FormattedMessage
          defaultMessage="Maturity: {date}"
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.typography.accent,
      lineType: LEGEND_LINE_TYPES.SOLID,
      formatTitle: (area: any) => (
        <FormattedMessage
          defaultMessage="Fixed Rate: {rate}"
          values={{ rate: formatNumberAsPercent(area) }}
        />
      ),
    },
  };

  return { areaChartData, apyToolTipData, chartHeaderData };
};

export default useInteractiveMaturityChart;
