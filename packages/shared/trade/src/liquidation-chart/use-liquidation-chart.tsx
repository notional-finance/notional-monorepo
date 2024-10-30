import { useTheme } from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import {
  ChartToolTipDataProps,
  CountUp,
  ChartHeaderDataProps,
  LEGEND_LINE_TYPES,
  AreaChartStylesProps,
} from '@notional-finance/mui';
import { TradeState } from '@notional-finance/notionable';
import {
  useAssetPriceHistory,
  useTradeLiquidationPrice,
} from '@notional-finance/notionable-hooks';
import { getDateString } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { AxisDomain } from 'recharts/types/util/types';

export function useLiquidationChart(state: TradeState) {
  const theme = useTheme();
  const { collateral, inputsSatisfied, calculationSuccess } = state;
  const liquidationPrice = useTradeLiquidationPrice();
  const deposit = state.deposit || liquidationPrice?.underlying;

  const areaChartData = useAssetPriceHistory(collateral).map(
    ({ timestamp, assetPrice }) => ({
      timestamp,
      area: assetPrice,
      line: liquidationPrice?.toFloat(),
    })
  );

  const yAxisDomain: AxisDomain = ['dataMin * 0.95', 'dataMax * 1.05'];
  const currentPrice =
    deposit && collateral
      ? TokenBalance.unit(collateral).toToken(deposit)
      : undefined;
  const pricePair = collateral
    ? `${formatTokenType(collateral).title}/${deposit?.symbol}`
    : '';

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: LEGEND_LINE_TYPES.NONE,
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage={'{date}'}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
      formatTitle: (area) => (
        <FormattedMessage
          defaultMessage={'{price} {pricePair} Price'}
          values={{
            pricePair,
            price: <span>{area?.toFixed(3) || '-'}</span>,
          }}
        />
      ),
    },
    line: {
      lineColor: theme.palette.error.main,
      lineType: LEGEND_LINE_TYPES.DASHED,
      formatTitle: (line) =>
        line ? (
          <FormattedMessage
            defaultMessage={'{price} Liquidation Price'}
            values={{
              price: <span>{line?.toFixed(3) || '-'}</span>,
            }}
          />
        ) : (
          ''
        ),
    },
  };

  const areaChartHeaderData: ChartHeaderDataProps = {
    textHeader: (
      <FormattedMessage
        defaultMessage={'{pricePair} Price'}
        values={{ pricePair }}
      />
    ),
    legendData: [
      {
        label: pricePair || 'Price',
        value: currentPrice ? (
          <CountUp value={currentPrice.toFloat()} decimals={4} />
        ) : undefined,
        lineColor: theme.palette.charts.main,
        lineType: LEGEND_LINE_TYPES.SOLID,
      },
      {
        label: <FormattedMessage defaultMessage={'Liquidation Price'} />,
        value: liquidationPrice ? (
          <CountUp value={liquidationPrice.toFloat()} decimals={4} />
        ) : undefined,
        lineColor: theme.palette.error.main,
        lineType: LEGEND_LINE_TYPES.DASHED,
      },
    ],
  };

  const areaChartStyles: AreaChartStylesProps = {
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
    },
    line: {
      lineColor: theme.palette.error.main,
      lineType: LEGEND_LINE_TYPES.DASHED,
    },
  };

  return {
    areaChartData: areaChartData.slice(1, areaChartData.length),
    areaChartStyles,
    areaChartHeaderData,
    chartToolTipData,
    yAxisDomain,
    showEmptyState: liquidationPrice
      ? false
      : !inputsSatisfied || !calculationSuccess,
  };
}
