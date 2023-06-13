import { Box, styled } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { BarChart, BarChartProps } from '../bar-chart/bar-chart';
import { AreaChart, AreaChartProps } from '../area-chart/area-chart';
import { ChartHeader } from '../chart-header/chart-header';

interface SingleDisplayChartProps extends AreaChartProps, BarChartProps {
  chartType: 'area' | 'bar';
  legendData: any;
}

export const SingleDisplayChart = ({
  areaChartData,
  legendData,
  chartToolTipData,
  chartType,
}: SingleDisplayChartProps) => {
  const barChartStyles = {
    dataSetOne: {
      lineColor: legendData?.legendTwo?.lineColor,
      lineType: legendData?.legendTwo?.lineType,
    },
    dataSetTwo: {
      lineColor: legendData?.legendOne.lineColor,
      lineType: legendData?.legendOne?.lineType,
    },
  };

  const areaChartStyles = {
    line: {
      lineColor: legendData?.legendTwo?.lineColor,
      lineType: legendData?.legendTwo?.lineType,
    },
    area: {
      lineColor: legendData?.legendOne.lineColor,
      lineType: legendData?.legendOne?.lineType,
    },
  };

  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      <ChartContainer>
        {legendData && <ChartHeader legendData={legendData} />}
        {chartType === 'area' && (
          <AreaChart
            areaChartData={areaChartData}
            chartToolTipData={chartToolTipData}
            areaChartStyles={areaChartStyles}
          />
        )}
        {chartType === 'bar' && <BarChart barChartStyles={barChartStyles} />}
      </ChartContainer>
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

export default SingleDisplayChart;
