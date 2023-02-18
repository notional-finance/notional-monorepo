import { Box, styled } from '@mui/material';
import { H5 } from '../typography/typography';
import { TooltipProps } from 'recharts';

export interface ChartToolTipDataProps {
  timestamp?: {
    title: (data: number) => string | JSX.Element;
  };
  area?: {
    title: (data: number) => string | JSX.Element;
  };
  line?: {
    title: (data: number) => string | JSX.Element;
  };
}

export interface ChartToolTipProps extends TooltipProps<number, string> {
  chartToolTipData?: ChartToolTipDataProps;
}

export const ChartToolTip = (props: ChartToolTipProps) => {
  const { active, payload, chartToolTipData } = props;

  if (active && payload) {
    const { line, area, timestamp } = payload[0].payload;

    return (
      <ToolTipBox>
        {chartToolTipData?.timestamp && (
          <H5>{chartToolTipData?.timestamp.title(timestamp)}</H5>
        )}
        {chartToolTipData?.area && area && (
          <H5>{chartToolTipData?.area.title(area)}</H5>
        )}
        {chartToolTipData?.line && line && (
          <H5>{chartToolTipData?.line.title(line)}</H5>
        )}
      </ToolTipBox>
    );
  }
  return null;
};

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
