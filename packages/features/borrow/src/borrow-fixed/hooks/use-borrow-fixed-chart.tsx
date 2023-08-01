import { useContext } from 'react';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ChartToolTipDataProps } from '@notional-finance/mui';
import { BorrowFixedContext } from '../../borrow-fixed/borrow-fixed';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import {
  getDateString,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { useMaturitySelect } from '@notional-finance/trade';

export const useBorrowFixedChart = () => {
  const theme = useTheme();
  const {
    state: { deposit },
  } = useContext(BorrowFixedContext);
  const { onSelect } = useMaturitySelect('Debt', BorrowFixedContext);
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
