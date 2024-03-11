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

export const useInteractiveMaturityChart = (
  token: TokenDefinition | undefined,
  isBorrow?: boolean
) => {
  const theme = useTheme();
  const fCashMarket = useFCashMarket(token);
  const areaChartData = fCashMarket
    ? fCashMarket.balances.map((data) => {
        // Shows the variable lend or borrow rate depending on the
        // input flag
        const interestRate =
          isBorrow && data.token.tokenType === 'PrimeCash'
            ? fCashMarket.getSpotInterestRate(data.toPrimeDebt().token)
            : fCashMarket.getSpotInterestRate(data.token);
        return {
          timestamp: data.token.maturity || 0,
          area: interestRate,
          marketKey: data.tokenId,
        };
      })
    : [];

  const chartHeaderData = {
    textHeader: <FormattedMessage defaultMessage={'APY by Maturity'} />,
  };

  const apyToolTipData: ChartToolTipDataProps = {
    timestamp: {
      formatTitle: (timestamp: number) => (
        <FormattedMessage
          defaultMessage="Maturity: {date}"
          values={{ date: timestamp === 0 ? 'None' : getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.typography.accent,
      lineType: LEGEND_LINE_TYPES.SOLID,
      formatTitle: (area: number) => (
        <FormattedMessage
          defaultMessage="Interest Rate: {rate}"
          values={{ rate: formatNumberAsPercent(area) }}
        />
      ),
    },
  };

  return { areaChartData, apyToolTipData, chartHeaderData };
};

export default useInteractiveMaturityChart;
