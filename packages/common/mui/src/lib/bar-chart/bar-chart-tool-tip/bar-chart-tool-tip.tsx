import { Box, styled } from '@mui/material';
import { H5 } from '../../typography/typography';
import { TooltipProps } from 'recharts';

export interface BarChartToolTipDataProps {
  dataPointOne?: {
    lineColor: string;
    lineType: 'dashed' | 'solid' | 'none';
    formatTitle: (data: number) => string | JSX.Element;
  };
  dataPointTwo?: {
    lineColor: string;
    lineType: 'dashed' | 'solid' | 'none';
    formatTitle: (data: number) => string | JSX.Element;
  };
  dataPointThree?: {
    lineColor: string;
    lineType: 'dashed' | 'solid' | 'none';
    formatTitle: (data: number) => string | JSX.Element;
  };
}

export interface BarChartToolTipProps extends TooltipProps<number, string> {
  barChartToolTipData?: any;
}

export const BarChartToolTip = (props: BarChartToolTipProps) => {
  const { active, payload, barChartToolTipData } = props;
  if (active && payload) {
    const { dataPointOne, dataPointTwo, total } = payload[0].payload;

    return (
      <ToolTipBox>
        {barChartToolTipData?.dataPointOne && (
          <Item
            sx={{
              borderColor: barChartToolTipData?.dataPointOne.lineColor,
              borderStyle: barChartToolTipData?.dataPointOne.lineType,
            }}
          >
            {barChartToolTipData?.dataPointOne.formatTitle(dataPointOne)}
          </Item>
        )}
        {barChartToolTipData?.dataPointTwo && dataPointTwo && (
          <Item
            sx={{
              borderColor: barChartToolTipData?.dataPointTwo.lineColor,
              borderStyle: barChartToolTipData?.dataPointTwo.lineType,
            }}
          >
            {barChartToolTipData?.dataPointTwo.formatTitle(dataPointTwo)}
          </Item>
        )}
        {barChartToolTipData?.total && total && (
          <Item sx={{ borderColor: 'transparent', borderStyle: 'solid' }}>
            {barChartToolTipData?.total.formatTitle(
              dataPointOne + dataPointTwo
            )}
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

export default BarChartToolTip;
