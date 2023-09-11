import { useState } from 'react';
import { Box, styled } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';

interface MultiDisplayChartProps {
  chartComponents: {
    id: string;
    title: string;
    Component: any;
  }[];
}

// CHART NOTES:
// - needs to be able to display any chart type bar, area, interactive, line, etc.
// - needs to be able typed properly
// - take array of chart components
// - always render the first chart in the array
// - the main purpose of this component will be to switch between charts and display button options
// - must also be able to display value on the right hand side of the chart in the header

export const MultiDisplayChart = ({
  chartComponents,
}: MultiDisplayChartProps) => {
  const [visibleChart, setVisibleChart] = useState(chartComponents[0].id);

  const currentChart = chartComponents.find(({ id }) => id === visibleChart);

  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      {chartComponents.map(({ id, title }) => (
        <Box onClick={() => setVisibleChart(id)}>{title}</Box>
      ))}
      <ChartContainer>{currentChart}</ChartContainer>
    </TradeSummaryBox>
  );
};

const ChartContainer = styled(Box)(
  ({ theme }) => `
    width: 100%;
    height: 100%;
    font-size: ${theme.typography.body1.fontSize};
    .recharts-area-curve {
      filter: drop-shadow(${theme.shape.chartLineShadow});
    }
  `
);

export default MultiDisplayChart;
