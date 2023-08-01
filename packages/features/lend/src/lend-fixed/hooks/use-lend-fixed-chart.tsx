import { useContext } from 'react';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ChartToolTipDataProps } from '@notional-finance/mui';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import {
  getDateString,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { useMaturitySelect } from '@notional-finance/trade';

export const useLendFixedChart = () => {
  const theme = useTheme();
  const {
    state: { deposit },
  } = useContext(LendFixedContext);
  const { onSelect } = useMaturitySelect('Collateral', LendFixedContext);
  const fCashMarket = useFCashMarket(deposit?.currencyId);
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

  const legendData = {
    textHeader: <FormattedMessage defaultMessage={'APY by Maturity'} />,
  };

  const chartToolTipData: ChartToolTipDataProps = {
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
      lineType: 'solid',
      formatTitle: (area: any) => (
        <FormattedMessage
          defaultMessage="Fixed Rate: {rate}"
          values={{ rate: formatNumberAsPercent(area) }}
        />
      ),
    },
  };

  return { areaChartData, onSelect, chartToolTipData, legendData };
};
