import { useState, ReactNode } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { TradeSummaryBox } from '../trade-summary-box/trade-summary-box';
import { Body } from '../typography/typography';
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
import SimpleToggle from '../simple-toggle/simple-toggle';

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
  const [visibleChart, setVisibleChart] = useState(0);
  const currentChart = chartComponents[visibleChart];
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
            <SimpleToggle
              selectedTabIndex={visibleChart}
              tabVariant="standard"
              tabLabels={chartComponents.map(({ title }) => title)}
              onChange={(_, value) => setVisibleChart(value as number)}
            />
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
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:first-of-type,
  .recharts-wrapper .recharts-cartesian-grid-horizontal line:last-child {
    stroke-opacity: ${hideTopGridLine ? '0 !important' : ''};
  }
`
);


export default MultiDisplayChart;
