import { ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { NotionalTheme } from '@notional-finance/styles';
import { ChartHeaderDataProps } from '../chart-header/chart-header';
import ChartHeaderTotals, {
  ChartHeaderTotalsDataProps,
} from '../chart-header-totals';
import { chartInfoBoxDataProps } from '../chart-info-box/chart-info-box';

interface ChartComponentsProps {
  id: string;
  title: string;
  Component: ReactNode;
  chartHeaderData?: ChartHeaderDataProps;
  chartHeaderTotalsData?: ChartHeaderTotalsDataProps[];
  chartInfoBoxData?: chartInfoBoxDataProps[];
  bottomLabel?: ReactNode;
  hideTopGridLine?: boolean;
}

interface ChartContainerProps {
  theme: NotionalTheme;
  hideTopGridLine?: boolean;
}

export interface DisplayChartProps {
  chartComponent: ChartComponentsProps;
}

export const DisplayChartMobile = ({ chartComponent }: DisplayChartProps) => {
  const theme = useTheme();

  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      {chartComponent?.chartHeaderTotalsData && (
        <ChartHeaderTotals
          chartHeaderTotalsData={chartComponent?.chartHeaderTotalsData}
        />
      )}
      <ChartContainer
        hideTopGridLine={chartComponent?.hideTopGridLine}
        theme={theme}
      >
        {chartComponent?.Component}
      </ChartContainer>
    </TradeSummaryBox>
  );
};

const ChartContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hideTopGridLine',
})(
  ({ hideTopGridLine, theme }: ChartContainerProps) => `
  width: 100%;
  height: 100%;
  font-size: ${theme.typography.body1.fontSize};
  .recharts-area-curve {
    filter: drop-shadow(${theme.shape.chartLineShadow});
  }
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:first-of-type,
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:last-child {
    stroke-opacity: ${hideTopGridLine ? '0 !important' : ''};
  }
`
);

export default DisplayChartMobile;
