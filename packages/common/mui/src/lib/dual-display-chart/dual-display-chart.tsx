import { useState, ReactElement } from 'react';
import { Box, styled } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { BarChart, BarChartProps } from '../bar-chart/bar-chart';
import { AreaChart, AreaChartProps } from '../area-chart/area-chart';
import { ChartHeader } from '../chart-header/chart-header';

interface DualDisplayChartProps extends AreaChartProps, BarChartProps {
  areaChartButtonLabel: ReactElement<any, any>;
  barChartButtonLabel: ReactElement<any, any>;
  areaChartLegendData?: any;
  barChartLegendData?: any;
  barChartToolTipData?: any;
}

export const DualDisplayChart = ({
  areaChartData,
  areaChartLegendData,
  barChartLegendData,
  chartToolTipData,
  barChartToolTipData,
  areaChartButtonLabel,
  barChartButtonLabel,
}: DualDisplayChartProps) => {
  const [displayAreaChart, setDisplayAreaChart] = useState(false);

  const barChartStyles = {
    dataSetOne: {
      lineColor: barChartLegendData?.legendTwo?.lineColor,
      lineType: barChartLegendData?.legendTwo?.lineType,
    },
    dataSetTwo: {
      lineColor: barChartLegendData?.legendOne.lineColor,
      lineType: barChartLegendData?.legendOne?.lineType,
    },
  };

  const areaChartStyles = {
    line: {
      lineColor: areaChartLegendData?.legendTwo?.lineColor,
      lineType: areaChartLegendData?.legendTwo?.lineType,
    },
    area: {
      lineColor: areaChartLegendData?.legendOne.lineColor,
      lineType: areaChartLegendData?.legendOne?.lineType,
    },
  };

  return (
    <TradeSummaryBox sx={{ width: '100%' }}>
      <ChartContainer>
        {displayAreaChart ? (
          <>
            {areaChartLegendData && (
              <ChartHeader
                displayAreaChart={displayAreaChart}
                legendData={areaChartLegendData}
                headerCallBack={setDisplayAreaChart}
                areaChartButtonLabel={areaChartButtonLabel}
                barChartButtonLabel={barChartButtonLabel}
              />
            )}
            <AreaChart
              areaChartData={areaChartData}
              chartToolTipData={chartToolTipData}
              areaChartStyles={areaChartStyles}
            />
          </>
        ) : (
          <>
            {barChartLegendData && (
              <ChartHeader
                displayAreaChart={displayAreaChart}
                legendData={barChartLegendData}
                headerCallBack={setDisplayAreaChart}
                areaChartButtonLabel={areaChartButtonLabel}
                barChartButtonLabel={barChartButtonLabel}
              />
            )}
            <BarChart
              barChartToolTipData={barChartToolTipData}
              barChartStyles={barChartStyles}
            />
          </>
        )}
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

export default DualDisplayChart;
