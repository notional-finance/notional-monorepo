import { Box, styled } from '@mui/material';
import {
  formatNumberAsPercent,
  getDateString,
} from '@notional-finance/helpers';
import { H5 } from '@notional-finance/mui';
import { ONE_WEEK } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { TooltipProps } from 'recharts';
import { messages } from '../messages';

const ToolTipBox = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.common.white};
  padding: ${theme.spacing(2)};
  text-align: left;
  box-shadow: ${theme.shape.shadowStandard}
`
);

export const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload } = props;

  if (active && payload) {
    const { line, area, timestamp } = payload[0].payload;
    return (
      <ToolTipBox>
        <H5>
          <FormattedMessage
            {...messages.summary.date}
            values={{ date: getDateString(timestamp) }}
          />
        </H5>
        <H5>
          <FormattedMessage
            {...messages.summary.performanceStrategyReturns}
            values={{ returns: formatNumberAsPercent(area) }}
          />
        </H5>
        {line && (
          <H5 fontWeight="medium">
            <FormattedMessage
              {...messages.summary.performanceLeveragedReturns}
              values={{ returns: formatNumberAsPercent(line) }}
            />
          </H5>
        )}
      </ToolTipBox>
    );
  }

  return null;
};

export default CustomTooltip;
