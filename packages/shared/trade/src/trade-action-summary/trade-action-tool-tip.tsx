import { Box, styled } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { H5 } from '@notional-finance/mui';
import { TooltipProps } from 'recharts';

const ToolTipBox = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  text-align: left;
  box-shadow: ${theme.shape.shadowStandard}
`
);

export const TradeActionTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;

  if (active && payload) {
    const { area, timestamp } = payload[0].payload;
    return (
      <ToolTipBox>
        <H5>{getDateString(timestamp)}</H5>
        <H5>{formatNumberAsPercent(area)}</H5>
      </ToolTipBox>
    );
  }

  return null;
};

export default TradeActionTooltip;
