import { useState, ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { H4, Body } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import {
  ChartHeader,
  ChartHeaderDataProps,
} from '../chart-header/chart-header';
import {
  ChartHeaderTotals,
  ChartHeaderTotalsDataProps,
} from '../chart-header-totals/chart-header-totals';
import {
  ChartInfoBox,
  chartInfoBoxDataProps,
} from '../chart-info-box/chart-info-box';

export interface ChartComponentsProps {
  id: string;
  title: string;
  Component: ReactNode;
  chartHeaderData?: ChartHeaderDataProps;
  chartHeaderTotalsData?: ChartHeaderTotalsDataProps[];
  chartInfoBoxData?: chartInfoBoxDataProps[];
  bottomLabel?: ReactNode;
  hideTopGridLine?: boolean;
}

export interface ChartContainerProps {
  theme: NotionalTheme;
  hideTopGridLine?: boolean;
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
    <TradeSummaryBox sx={{ width: '100%', padding: theme.spacing(3) }}>
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
              {chartComponents.map(({ id, title }, index) => (
                <H4
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    paddingBottom: theme.spacing(1),
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
          <ChartContainer
            hideTopGridLine={currentChart?.hideTopGridLine}
            theme={theme}
          >
            {currentChart?.Component}
          </ChartContainer>
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
          {currentChart?.chartHeaderTotalsData && (
            <ChartHeaderTotals
              chartHeaderTotalsData={currentChart?.chartHeaderTotalsData}
            />
          )}
          <ChartContainer
            hideTopGridLine={currentChart?.hideTopGridLine}
            theme={theme}
          >
            {currentChart?.Component}
          </ChartContainer>
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

export const ChartContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hideTopGridLine',
})(
  ({ hideTopGridLine, theme }: ChartContainerProps) => `
  width: 100%;
  height: 100%;
  font-size: ${theme.typography.body1.fontSize};
  .recharts-area-curve {
    filter: drop-shadow(${theme.shape.chartLineShadow});
  }
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:first-child,
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:last-child {
    stroke-opacity: ${hideTopGridLine ? '0 !important' : ''};
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
