import { useTheme, Box, styled } from '@mui/material';
import { H5 } from '../typography/typography';
import { TooltipProps } from 'recharts';
import { LEGEND_LINE_TYPES } from '../chart-header/chart-header';

export interface ChartToolTipDataProps {
  timestamp?: {
    lineColor?: string;
    lineType?: LEGEND_LINE_TYPES;
    formatTitle: (data: number) => string | JSX.Element;
  };
  area?: {
    lineColor?: string;
    lineType?: LEGEND_LINE_TYPES;
    formatTitle: (data: number) => string | JSX.Element;
  };
  line?: {
    lineColor?: string;
    lineType?: LEGEND_LINE_TYPES;
    formatTitle: (data: number) => string | JSX.Element;
  };
}

export interface ChartToolTipProps extends TooltipProps<number, string> {
  chartToolTipData?: ChartToolTipDataProps;
  areaDataKey?: string;
  lineDataKey?: string;
}

// NOTES:
// - Set lineType to 'none' to remove the line from the tooltip
// - To ensure that the font color and font weight are the same wrap the entire FormattedMessage coming from the props in a span

export const ChartToolTip = ({
  active,
  payload,
  chartToolTipData,
  areaDataKey = 'area',
  lineDataKey = 'line',
}: ChartToolTipProps) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    const { timestamp } = payload[0].payload;
    const area = payload[0].payload[areaDataKey];
    const line = payload[0].payload[lineDataKey];

    return (
      <ToolTipBox>
        {chartToolTipData?.timestamp && (
          <Item
            sx={{
              borderColor: chartToolTipData?.timestamp.lineColor
                ? chartToolTipData?.timestamp.lineColor
                : 'transparent',
              borderStyle: chartToolTipData?.timestamp.lineType
                ? chartToolTipData?.timestamp.lineType
                : 'solid',
              paddingLeft:
                chartToolTipData?.timestamp.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
              marginLeft:
                chartToolTipData?.timestamp.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
              marginBottom: theme.spacing(2),
            }}
          >
            {chartToolTipData?.timestamp.formatTitle(timestamp)}
          </Item>
        )}
        {chartToolTipData?.area && (
          <Item
            sx={{
              borderColor: chartToolTipData?.area.lineColor,
              borderStyle: chartToolTipData?.area.lineType,
              paddingLeft:
                chartToolTipData?.area.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
              marginLeft:
                chartToolTipData?.area.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
            }}
          >
            {chartToolTipData?.area.formatTitle(area)}
          </Item>
        )}
        {chartToolTipData?.line && (
          <Item
            sx={{
              borderColor: chartToolTipData?.line.lineColor,
              borderStyle: chartToolTipData?.line.lineType,
              paddingLeft:
                chartToolTipData?.line.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
              marginLeft:
                chartToolTipData?.line.lineType === 'none'
                  ? theme.spacing(0.5)
                  : '',
            }}
          >
            {chartToolTipData?.line.formatTitle(line)}
          </Item>
        )}
      </ToolTipBox>
    );
  }
  return null;
};

const Item = styled(H5)(
  ({ theme }) => `
  border-left: 3px;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
  margin: ${theme.spacing(1)};
  padding-left: 8px;
  span {
    color: ${theme.palette.typography.main};
    margin-right: ${theme.spacing(1)};
  }
  display: flex;
`
);

const ToolTipBox = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  text-align: left;
  box-shadow: ${theme.shape.shadowStandard};
  outline: none;
`
);

export default ChartToolTip;
