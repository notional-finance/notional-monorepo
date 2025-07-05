import { useTheme } from '@mui/material';
import { TokenDefinition } from '@notional-finance/core-entities';
import { formatNumber } from '@notional-finance/helpers';
import { getDateString } from '@notional-finance/util';
import {
  ChartToolTipDataProps,
  AreaChartStylesProps,
  LEGEND_LINE_TYPES,
} from '@notional-finance/mui';
import { isVaultTrade } from '@notional-finance/notionable';
import {
  calculateDepositValue,
  useCurrentTradeContext,
  useLeveragedPerformance,
  useSpotMaturityData,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

export function usePerformanceChart(currentPositionFactors?: {
  collateralToken?: TokenDefinition;
  isPrimeBorrow: boolean;
  borrowRate?: number;
  leverageRatio?: number;
}) {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const {
    collateral: _collateral,
    debt,
    deposit,
  } = trade?.selectedTokens || {};
  const selectedLeverageRatio = trade?.leverageRatio;
  const { action } = useParams<{ action: string }>();

  // Allow the vault collateral to override the set collateral for the unset state
  const collateral = currentPositionFactors?.collateralToken || _collateral;
  const tradeType = trade?.tradeType;
  const { debt: debtOptions } = trade?.computedOptions || {};

  const spotData = useSpotMaturityData(debt ? [debt] : undefined);
  const isVault = isVaultTrade(tradeType);

  const currentBorrowRate =
    debtOptions?.find((t) => t.token.id === debt?.id && action !== 'Manage')
      ?.interestRate ||
    // Allow the historical vault borrow rate to be applied here
    currentPositionFactors?.borrowRate ||
    spotData.find((_) => true)?.tradeRate;

  // Always use the specified leverage ratio so that this figure matches
  // the header
  const leverageRatio = (selectedLeverageRatio ||
    currentPositionFactors?.leverageRatio) as number | undefined;
  const data = useLeveragedPerformance(
    collateral,
    debt
      ? debt.tokenType === 'PrimeDebt'
      : currentPositionFactors?.isPrimeBorrow || false,
    currentBorrowRate,
    leverageRatio
  );
  const areaChartData = calculateDepositValue(
    leverageRatio,
    data,
    isVault ? 30 : 90
  );

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

  return {
    areaChartData,
    areaChartStyles,
    chartToolTipData,
    isEmptyState: currentBorrowRate === undefined,
  };
}
