import { useTheme } from '@mui/material';
import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import {
  ChartToolTipDataProps,
  CountUp,
  ChartHeaderDataProps,
  LEGEND_LINE_TYPES,
  AreaChartStylesProps,
} from '@notional-finance/mui';
import {
  TradeState,
  useCurrentNetworkStore,
  VaultTradeState,
} from '@notional-finance/notionable';
import { useAssetPriceHistory } from '@notional-finance/notionable-hooks';
import { RATE_PRECISION, getDateString } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { AxisDomain } from 'recharts/types/util/types';

export function useLiquidationChart(
  state: TradeState | VaultTradeState,
  vaultCollateral?: TokenDefinition,
  vaultLiquidationPrice?: TokenBalance | null
) {
  const theme = useTheme();
  const currentNetworkStore = useCurrentNetworkStore();
  const {
    collateral,
    postAccountRisk,
    debt,
    tradeType,
    priorAccountRisk,
    inputsSatisfied,
    calculationSuccess,
  } = state;

  const token =
    tradeType === 'LeveragedLend' && collateral?.tokenType === 'PrimeCash'
      ? debt
      : collateral || vaultCollateral;

  const liquidationPrice = (
    postAccountRisk
      ? postAccountRisk.liquidationPrice.find(
          ({ asset }) => asset.id === token?.id
        )?.threshold
      : priorAccountRisk?.liquidationPrice.find(
          ({ asset }) => asset.id === token?.id
        )?.threshold || vaultLiquidationPrice
  )?.toUnderlying();
  const deposit = state.deposit || liquidationPrice?.underlying;

  const areaChartData = useAssetPriceHistory(token).map(
    ({ timestamp, assetPrice }) => ({
      timestamp,
      area: assetPrice,
      line: liquidationPrice?.toFloat(),
    })
  );

  let yAxisDomain: AxisDomain = ['dataMin * 0.95', 'dataMax * 1.05'];
  if (token?.tokenType === 'fCash') {
    // This range technically only applies to lending fCash but works as a boundary on the
    // fCash price anyway
    const { lowestDiscountFactor } =
      currentNetworkStore.getMinLendRiskAdjustedDiscountFactor(token);
    yAxisDomain = [lowestDiscountFactor / RATE_PRECISION, 1];
  }

  const currentPrice =
    deposit && token ? TokenBalance.unit(token).toToken(deposit) : undefined;
  const pricePair = token
    ? `${formatTokenType(token).title}/${deposit?.symbol}`
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
