import { useTheme } from '@mui/material';
import { PendlePT } from '@notional-finance/core-entities';
import {
  AreaChart,
  AreaChartStylesProps,
  ChartToolTipDataProps,
  LEGEND_LINE_TYPES,
  MultiDisplayChart,
} from '@notional-finance/mui';
import { VaultTradeState } from '@notional-finance/notionable';
import {
  calculateDepositValue,
  useSpotMaturityData,
  useVaultAdapter,
} from '@notional-finance/notionable-hooks';
import {
  floorToMidnight,
  formatNumber,
  getDateString,
  getNowSeconds,
  leveragedYield,
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault';
import { useVaultExistingFactors } from '../hooks';
import { useAssetPriceHistory } from '@notional-finance/notionable-hooks';

const usePendlePerformanceChart = (state: VaultTradeState) => {
  const dataPoints = 90;
  const {
    debt,
    debtOptions,
    collateralOptions,
    riskFactorLimit,
    vaultAddress,
  } = state;
  const spotData = useSpotMaturityData(debt ? [debt] : undefined);
  const { priorBorrowRate, leverageRatio: priorLeverageRatio } =
    useVaultExistingFactors();
  const adapter = useVaultAdapter(vaultAddress) as PendlePT | undefined;

  const nowMidnight = floorToMidnight(getNowSeconds());
  const ptExpires = adapter?.expiry;

  const leverageRatio = (riskFactorLimit?.limit || priorLeverageRatio) as
    | number
    | undefined;
  const fixedBorrowMaturity =
    debt && debt.maturity !== PRIME_CASH_VAULT_MATURITY
      ? debt.maturity
      : undefined;

  const primeBorrowRate = debtOptions?.find(
    (t) => t.token.maturity === PRIME_CASH_VAULT_MATURITY
  )?.interestRate;

  const ptAPY =
    collateralOptions?.find((t) => t.token.maturity === debt?.maturity)
      ?.interestRate ||
    adapter?.getVaultAPY() ||
    0;

  const currentBorrowRate =
    debtOptions?.find(
      (t) => t.token.id === debt?.id
      // Allow the historical vault borrow rate to be applied here
    )?.interestRate ||
    priorBorrowRate ||
    spotData.find((_) => true)?.tradeRate;

  const data = new Array(dataPoints).fill(0).map((_, i) => {
    const timestamp = nowMidnight + i * SECONDS_IN_DAY;
    const strategyReturn = ptExpires && timestamp <= ptExpires ? ptAPY : 0;
    const borrowRate =
      fixedBorrowMaturity && timestamp <= fixedBorrowMaturity
        ? currentBorrowRate
        : primeBorrowRate;

    return {
      timestamp,
      strategyReturn,
      borrowRate,
      leveragedReturn: leveragedYield(
        strategyReturn,
        borrowRate,
        leverageRatio
      ),
    };
  });

  const areaChartData = calculateDepositValue(leverageRatio, data, dataPoints);
  return { areaChartData, ptExpires, fixedBorrowMaturity };
};

export const PendlePerformanceChart = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { deposit, collateral } = state;

  const { areaChartData, ptExpires, fixedBorrowMaturity } =
    usePendlePerformanceChart(state);
  const priceData = useAssetPriceHistory(collateral);

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
      formatTitle: (area) => `${formatNumber(area)} ${deposit?.symbol}`,
    },
  };

  const areaChartStyles: AreaChartStylesProps = {
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
    },
  };
  const legendData = [
    {
      label: 'PT Expires',
      lineColor: theme.palette.charts.dark,
      lineType: LEGEND_LINE_TYPES.DASHED,
      value: ptExpires ? getDateString(ptExpires) : undefined,
    },
  ];

  if (fixedBorrowMaturity) {
    // Prepend this so that it does not move the entire legend
    legendData.unshift({
      label: 'Fixed Borrow Matures',
      lineColor: theme.palette.charts.accent,
      lineType: LEGEND_LINE_TYPES.DASHED,
      value: getDateString(fixedBorrowMaturity),
    });
  }

  return (
    <MultiDisplayChart
      chartComponents={[
        {
          id: 'area-chart',
          title: 'Estimated Performance',
          Component: (
            <AreaChart
              showCartesianGrid
              areaLineType="linear"
              yAxisDomain={['dataMin', 'dataMax']}
              yAxisTickFormat="number"
              xAxisTickFormat="date"
              xAxisTickCount={12}
              areaChartData={areaChartData}
              areaChartStyles={areaChartStyles}
              chartToolTipData={chartToolTipData}
              referenceLineValue={[
                {
                  value: fixedBorrowMaturity,
                  color: theme.palette.charts.accent,
                },
                {
                  value: ptExpires,
                  color: theme.palette.charts.dark,
                },
              ]}
            />
          ),
          chartHeaderData: {
            textHeader: (
              <FormattedMessage defaultMessage={'Estimated Performance'} />
            ),
            legendData,
          },
        },
        {
          id: 'price-area-chart',
          title: `Vault Share Price`,
          hideTopGridLine: true,
          Component: (
            <AreaChart
              title={`Vault Share Price`}
              showCartesianGrid
              xAxisTickFormat="date"
              yAxisTickFormat="double"
              yAxisDomain={['dataMin * 0.95', 'dataMax * 1.05']}
              areaDataKey={'assetPrice'}
              areaChartData={priceData}
            />
          ),
        },
      ]}
    />
  );
};
