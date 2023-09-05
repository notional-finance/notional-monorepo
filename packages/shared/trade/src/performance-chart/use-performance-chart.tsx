import { useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { ChartToolTipDataProps, CountUp } from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useLeveragedPerformance } from '@notional-finance/notionable-hooks';
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
  const { debt, debtOptions, collateralOptions, riskFactorLimit, tradeType } =
    state;
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
  const data = useLeveragedPerformance(
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
    line: d.leveragedReturn,
    area: d.strategyReturn,
  }));

  const currentStrategyReturn =
    data.length > 0 ? data[data.length - 1].strategyReturn : undefined;
  const currentLeveragedReturn =
    currentStrategyReturn !== undefined &&
    leverageRatio !== null &&
    leverageRatio !== undefined &&
    currentBorrowRate !== undefined
      ? currentStrategyReturn +
        (currentStrategyReturn - currentBorrowRate) * leverageRatio
      : undefined;

  const chartToolTipData: ChartToolTipDataProps = {
    timestamp: {
      lineColor: 'transparent',
      lineType: 'none',
      formatTitle: (timestamp) => (
        <FormattedMessage
          defaultMessage={'{date}'}
          values={{ date: getDateString(timestamp) }}
        />
      ),
    },
    area: {
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
      formatTitle: (area) => (
        <FormattedMessage
          defaultMessage={'{returns} Unleveraged Returns'}
          values={{ returns: <span>{formatNumberAsPercent(area)}</span> }}
        />
      ),
    },
    line: {
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
      formatTitle: (line) => (
        <FormattedMessage
          defaultMessage={'{returns} Leveraged Returns'}
          values={{ returns: <span>{formatNumberAsPercent(line)}</span> }}
        />
      ),
    },
  };

  const areaChartLegendData = {
    textHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: {
      label: <FormattedMessage defaultMessage={'Unleveraged Returns'} />,
      value: currentStrategyReturn ? (
        <CountUp value={currentStrategyReturn} suffix="%" decimals={3} />
      ) : undefined,
      lineColor: theme.palette.charts.main,
      lineType: 'solid',
    },
    legendTwo: {
      label: <FormattedMessage defaultMessage={'Leveraged Returns'} />,
      value: currentLeveragedReturn ? (
        <CountUp value={currentLeveragedReturn} suffix="%" decimals={3} />
      ) : undefined,
      lineColor: theme.palette.charts.accent,
      lineType: 'dashed',
    },
  };

  return {
    areaChartData,
    areaChartLegendData,
    chartToolTipData,
  };
}
