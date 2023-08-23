import { useTheme, Box, styled } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { BarChart, BarChartProps } from '../bar-chart/bar-chart';
import { AreaChart, AreaChartProps } from '../area-chart/area-chart';
import {
  ChartInfoBox,
  chartInfoBoxDataProps,
} from '../chart-info-box/chart-info-box';
import { ChartHeader } from '../chart-header/chart-header';
import { Body } from '../typography/typography';
import { ReactNode, useState } from 'react';

interface SingleDisplayChartProps extends AreaChartProps, BarChartProps {
  chartType: 'area' | 'bar';
  bottomLabel?: ReactNode;
  referenceLineValue?: number;
  xAxisTickFormat?: 'date' | 'percent';
  areaLineType?: 'linear' | 'monotone';
  legendData?: any;
  chartInfoBoxData?: chartInfoBoxDataProps[];
  showCartesianGrid?: boolean;
}

export const SingleDisplayChart = ({
  areaChartData,
  referenceLineValue,
  chartInfoBoxData,
  legendData,
  chartToolTipData,
  chartType,
  xAxisTickFormat,
  yAxisTickFormat,
  yAxisDomain,
  areaLineType,
  showCartesianGrid,
  condenseXAxisTime,
  bottomLabel,
}: SingleDisplayChartProps) => {
  const theme = useTheme();
  const [chartInfoBoxActive, setChartInfoBoxActive] = useState<
    boolean | undefined
  >(undefined);
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
        {legendData && (
          <ChartHeader
            legendData={legendData}
            setChartInfoBoxActive={setChartInfoBoxActive}
          />
        )}
        {chartType === 'area' && (
          <AreaChart
            showCartesianGrid={showCartesianGrid}
            referenceLineValue={referenceLineValue}
            xAxisTickFormat={xAxisTickFormat}
            yAxisTickFormat={yAxisTickFormat}
            yAxisDomain={yAxisDomain}
            areaChartData={areaChartData}
            chartToolTipData={chartToolTipData}
            areaChartStyles={areaChartStyles}
            condenseXAxisTime={condenseXAxisTime}
            areaLineType={areaLineType}
          />
        )}
        {chartType === 'bar' && <BarChart barChartStyles={barChartStyles} />}
        {bottomLabel && (
          <Body sx={{ textAlign: 'center', marginTop: theme.spacing(1) }}>
            {bottomLabel}
          </Body>
        )}
      </ChartContainer>
      {chartInfoBoxData && chartInfoBoxActive !== undefined && (
        <ChartInfoBox
          setChartInfoBoxActive={setChartInfoBoxActive}
          chartInfoBoxActive={chartInfoBoxActive}
          chartInfoBoxData={chartInfoBoxData}
        />
      )}
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
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:first-child,
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:last-child,
  .recharts-wrapper .recharts-cartesian-grid-vertical line:first-child,
  .recharts-wrapper .recharts-cartesian-grid-vertical line:last-child {
    stroke-opacity: 0 !important;
  }
`
);

export default SingleDisplayChart;
