import { useState, ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { H4, Body } from '../typography/typography';
import {
  ChartHeader,
  ChartHeaderDataProps,
} from '../chart-header/chart-header';
import {
  ChartInfoBox,
  chartInfoBoxDataProps,
} from '../chart-info-box/chart-info-box';

interface ChartComponentsProps {
  id: string;
  title: string;
  Component: ReactNode;
  chartHeaderData?: ChartHeaderDataProps;
  chartInfoBoxData?: chartInfoBoxDataProps[];
  bottomLabel?: ReactNode;
}

interface MultiDisplayChartProps {
  chartComponents: ChartComponentsProps[];
}

export const MultiDisplayChart = ({
  chartComponents,
}: MultiDisplayChartProps) => {
  const theme = useTheme();
  const [visibleChart, setVisibleChart] = useState(chartComponents[0].id);
  const currentChart = chartComponents.find(({ id }) => id === visibleChart);
  const [chartInfoBoxActive, setChartInfoBoxActive] = useState<
    boolean | undefined
  >(undefined);

  return (
    <TradeSummaryBox sx={{ width: '100%', padding: '24px' }}>
      {chartComponents.length > 1 ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <ButtonContainer>
              {chartComponents.map(({ id, title }) => (
                <H4
                  sx={{
                    cursor: 'pointer',
                    paddingBottom: '8px',
                    borderBottom:
                      id === visibleChart
                        ? `2px solid ${theme.palette.charts.main}`
                        : 'none',
                    color:
                      id === visibleChart
                        ? theme.palette.charts.main
                        : theme.palette.typography.light,
                  }}
                  onClick={() => setVisibleChart(id)}
                >
                  {title}
                </H4>
              ))}
            </ButtonContainer>
            {currentChart?.chartHeaderData && (
              <ChartHeader
                chartHeaderData={currentChart?.chartHeaderData}
                setChartInfoBoxActive={setChartInfoBoxActive}
                showInfoIcon={currentChart?.chartInfoBoxData ? true : false}
              />
            )}
          </Box>
          <ChartContainer>{currentChart?.Component}</ChartContainer>
        </>
      ) : (
        <>
          {currentChart?.chartHeaderData && (
            <ChartHeader
              chartHeaderData={currentChart?.chartHeaderData}
              setChartInfoBoxActive={setChartInfoBoxActive}
              showInfoIcon={currentChart?.chartInfoBoxData ? true : false}
            />
          )}
          <ChartContainer>{currentChart?.Component}</ChartContainer>
          {currentChart?.bottomLabel && (
            <Body sx={{ textAlign: 'center', marginTop: theme.spacing(1) }}>
              {currentChart.bottomLabel}
            </Body>
          )}
          {currentChart?.chartInfoBoxData &&
            chartInfoBoxActive !== undefined && (
              <ChartInfoBox
                setChartInfoBoxActive={setChartInfoBoxActive}
                chartInfoBoxActive={chartInfoBoxActive}
                chartInfoBoxData={currentChart.chartInfoBoxData}
              />
            )}
        </>
      )}
    </TradeSummaryBox>
  );
};

export const ChartContainer = styled(Box)(
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

const ButtonContainer = styled(Box)(
  ({ theme }) => `
    display: flex;
    width: fit-content;
    padding: ${theme.spacing(1, 2)};
    padding-bottom: 0px;
    gap: ${theme.spacing(2)};
    border: ${theme.shape.borderStandard};
    border-radius: ${theme.shape.borderRadius()};
  `
);

export default MultiDisplayChart;
