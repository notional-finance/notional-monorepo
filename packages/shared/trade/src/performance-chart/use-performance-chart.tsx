import { useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';
import { formatNumber } from '@notional-finance/helpers';
import { RATE_PRECISION, getDateString } from '@notional-finance/util';
import {
  ChartToolTipDataProps,
  CountUp,
  AreaChartStylesProps,
  ChartHeaderDataProps,
  LEGEND_LINE_TYPES,
} from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useDepositValue } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

export function usePerformanceChart(
  state: BaseTradeState,
  priorVaultFactors?: {
    vaultShare?: TokenDefinition;
    isPrimeBorrow: boolean;
    vaultBorrowRate?: number;
    leverageRatio?: number;
  }
) {
  const theme = useTheme();
  const {
    debt,
    debtOptions,
    collateralOptions,
    riskFactorLimit,
    tradeType,
    deposit,
    depositBalance,
  } = state;
  const currentBorrowRate =
    debtOptions?.find(
      (t) => t.token.id === debt?.id
      // Allow the historical vault borrow rate to be applied here
    )?.interestRate || priorVaultFactors?.vaultBorrowRate;

  // Allow the vault collateral to override the set collateral for the unset state
  const collateral = state.collateral || priorVaultFactors?.vaultShare;

  const leveragedLendFixedRate =
    tradeType === 'LeveragedLend' && collateral?.tokenType === 'fCash'
      ? collateralOptions?.find((t) => t.token.id === collateral?.id)
          ?.interestRate
      : undefined;

  // Always use the specified leverage ratio so that this figure matches
  // the header
  const leverageRatio = (riskFactorLimit?.limit ||
    priorVaultFactors?.leverageRatio) as number | undefined;
  const data = useDepositValue(
    collateral,
    debt
      ? debt.tokenType === 'PrimeDebt'
      : priorVaultFactors?.isPrimeBorrow || false,
    currentBorrowRate,
    leverageRatio,
    leveragedLendFixedRate
  );

  const areaChartData = data.map((d) => ({
    timestamp: d.timestamp,
    area: d.multiple,
  }));

  const currentMultiple =
    data.length > 0 ? data[data.length - 1].multiple : undefined;
  const currentDepositValue =
    !!depositBalance &&
    leverageRatio !== null &&
    leverageRatio !== undefined &&
    currentMultiple
      ? depositBalance.mulInRatePrecision(
          Math.floor((currentMultiple / 100) * RATE_PRECISION)
        )
      : undefined;

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
          // eslint-disable-next-line no-template-curly-in-string
          defaultMessage={'{returns} Deposit Value'}
          values={{
            returns: (
              <span>
                {formatNumber(area)} {deposit?.symbol}
              </span>
            ),
          }}
        />
      ),
    },
  };

  const areaChartHeaderData: ChartHeaderDataProps = {
    legendData: [
      {
        label: (
          <FormattedMessage
            defaultMessage={'Deposit Value ({days}d)'}
            values={{ days: data.length }}
          />
        ),
        value: currentDepositValue ? (
          <CountUp
            value={currentDepositValue.toFloat()}
            suffix={` ${currentDepositValue.symbol}`}
            decimals={4}
          />
        ) : undefined,
        lineColor: theme.palette.charts.main,
        lineType: LEGEND_LINE_TYPES.SOLID,
      },
    ],
  };

  const areaChartStyles: AreaChartStylesProps = {
    area: {
      lineColor: theme.palette.charts.main,
      lineType: LEGEND_LINE_TYPES.SOLID,
    },
  };

  return {
    currentDepositValue,
    areaChartData,
    areaChartStyles,
    areaChartHeaderData,
    chartToolTipData,
  };
}
