import { useTheme, Box, styled } from '@mui/material';
import { H5 } from '../typography/typography';
import { TooltipProps } from 'recharts';

export interface ChartToolTipDataProps {
  timestamp?: {
    lineColor?: string;
    lineType?: 'dashed' | 'solid' | 'none';
    title: (data: number) => string | JSX.Element;
  };
  area?: {
    lineColor?: string;
    lineType?: 'dashed' | 'solid' | 'none';
    title: (data: number) => string | JSX.Element;
  };
  line?: {
    lineColor?: string;
    lineType?: 'dashed' | 'solid' | 'none';
    title: (data: number) => string | JSX.Element;
  };
}

export interface ChartToolTipProps extends TooltipProps<number, string> {
  chartToolTipData?: ChartToolTipDataProps;
}

// NOTES:
// - Set lineType to 'none' to remove the line from the tooltip
// - To ensure that the font color and font weight are the same wrap the entire FormattedMessage coming from the props in a span

export const ChartToolTip = (props: ChartToolTipProps) => {
  const theme = useTheme();
  const { active, payload, chartToolTipData } = props;

  if (active && payload) {
    const { line, area, timestamp } = payload[0].payload;

    return (
      <ToolTipBox>
        {chartToolTipData?.timestamp && (
          <Item
            sx={{
              borderColor: 'transparent',
              borderStyle: 'solid',
              color: theme.palette.typography.main,
              paddingLeft: '0px',
              marginLeft: theme.spacing(0.5),
              marginBottom: theme.spacing(2),
            }}
          >
            {chartToolTipData?.timestamp.title(timestamp)}
          </Item>
        )}
        {chartToolTipData?.area && area && (
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
            {chartToolTipData?.area.title(area)}
          </Item>
        )}
        {chartToolTipData?.line && line && (
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
            {chartToolTipData?.line.title(line)}
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
  }
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
