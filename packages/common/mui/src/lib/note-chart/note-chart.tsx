import type { CSSProperties } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { EChartsOption, type SetOptionOpts } from 'echarts';
import { H5 } from '../typography/typography';
import ReactECharts from 'echarts-for-react';
import { ReactNode } from 'react';
import { colors } from '@notional-finance/styles';
import { getDateString } from '@notional-finance/util';
import { formatNumber, formatNumberAsAbbr } from '@notional-finance/helpers';
import { useFiat } from '@notional-finance/notionable-hooks';

interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: 'light' | 'dark';
}

interface NoteChartProps {
  // TODO Add option type when data is available
  // option: ReactEChartsProps['option'];
  data: [Date, number][];
  title: ReactNode;
  largeValue: ReactNode | string;
  showMarkLines?: boolean;
  formatToolTipValueAsFiat?: boolean;
  noteNumCallback?: (value: number) => void;
}

export const NoteChart = ({
  // option,
  data,
  title,
  largeValue,
  showMarkLines,
  formatToolTipValueAsFiat,
  noteNumCallback,
}: NoteChartProps) => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const formatDateTooltip = (date: Date) => {
    return getDateString(date?.getTime(), {}, true);
  };

  const option: ReactEChartsProps['option'] = {
    grid: {
      left: '72px',
      right: '24px',
      top: '24px',
      bottom: '24px',
    },
    xAxis: {
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      type: 'time',
      axisLabel: {
        formatter: function (value) {
          const date = new Date(value);
          return getDateString(date.getTime(), {}, true); // Modify the date format as per your requirement
        },
        hideOverlap: true,
      },
      // boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#1C4E5C', // Change this to your desired color (e.g., light gray)
        },
      },
    },
    series: [
      {
        triggerLineEvent: true,
        // NOTE: This is the actual data for the chart
        data: data,
        type: 'line',
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: colors.neonTurquoise, // Set the color for the marker symbol
        },

        markLine: showMarkLines
          ? {
              symbolSize: [6, 6],
              lineStyle: {
                color: colors.neonTurquoise,
                width: 1,
                type: 'dashed',
              },
              label: {
                color: colors.white,
              },
              // NOTE: the coord array is [x, y] where x is the index of the xAxis data and y is the value of the yAxis data
              // The first array is the base point and the second is the end point
              data: [
                [
                  {
                    name: 'Today',
                    coord: [2, 0],
                  },
                  {
                    coord: [2, 400],
                  },
                ],
                [
                  {
                    name: 'Investor Supply',
                    coord: [5, 0],
                  },
                  {
                    coord: [5, 600],
                  },
                ],
              ],
            }
          : undefined,
        lineStyle: {
          color: colors.neonTurquoise,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(51, 248, 255, 0.44)',
              },
              {
                offset: 1,
                color: 'rgba(1, 46, 58, 0.00)',
              },
            ],
          },
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      borderColor: '#041D2E',
      backgroundColor: '#041D2E',
      padding: 0,
      // TODO: Bring in data format function for axisValue when available
      formatter: function (params) {
        try {
          const value = formatToolTipValueAsFiat
            ? formatNumberAsAbbr(params[0].data[1], 4, baseCurrency)
            : formatNumber(params[0].data[1]);
          if (noteNumCallback) {
            noteNumCallback(params[0].data[1]);
          }
          return `<div style="background-color: #041D2E; width: fit-content; box-shadow: -2px 1px 24px 0px rgba(135, 155, 215, 0.20), 0px 4px 16px 0px rgba(121, 209, 212, 0.40); padding: 8px; height: 58px;">
                  <div style="color: #BCD4DB; font-family: Avenir Next; font-weight: 500;">${formatDateTooltip(
                    params[0].data[0]
                  )}</div>
                  <div style="color: #ffffff; font-family: Avenir Next; font-weight: 500;" >${value}
                  </div>
                </div>`;
        } catch {
          return '<div></div>';
        }
      },
      position: function (pt) {
        return [pt[0], '10%'];
      },
    },
  };

  return (
    <NoteChartContainer id="NOTE CHART">
      <LabelContainer>
        <Box>
          <H5>{title}</H5>
          {largeValue}
        </Box>
        {/* <Box sx={{ display: 'flex' }}>
          <LabelValue
            sx={{ color: colors.neonTurquoise, marginRight: theme.spacing(1) }}
          >
            +3.26%
          </LabelValue>
          <LabelValue sx={{ fontSize: '12px', color: '#BCD4DB' }}>
            (30d)
          </LabelValue>
        </Box> */}
      </LabelContainer>
      <ReactECharts option={option} style={{ height: theme.spacing(32.5) }} />
    </NoteChartContainer>
  );
};

const NoteChartContainer = styled(Box)(
  ({ theme }) => `
      height: 100%;
      min-width: ${theme.spacing(93)};
      max-height: ${theme.spacing(55.5)};
      padding: ${theme.spacing(3)};
      border: ${theme.shape.borderStandard};
      border-radius: ${theme.shape.borderRadius()};
      background: #041D2E;
      ${theme.breakpoints.down('sm')} {
        min-width: 0px;
        padding: ${theme.spacing(2)};
      }
  `
);

const LabelContainer = styled(Box)(
  ({ theme }) => `
      padding-bottom: ${theme.spacing(2)};
      display: flex;
      justify-content: space-between;
  `
);

export default NoteChart;
