import { Box, useTheme } from '@mui/material';
import { trackEvent } from '@notional-finance/helpers';
import { CountUp, H4, InfoTooltip, Subtitle } from '@notional-finance/mui';
import { APYData } from '@notional-finance/notionable';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

export const LiquidityYieldInfo = ({
  liquidityYieldData,
}: {
  liquidityYieldData: APYData;
}) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const organicAPY =
    (liquidityYieldData.feeAPY || 0) + (liquidityYieldData.organicAPY || 0);
  return (
    <Box display="inline-flex" sx={{ marginTop: theme.spacing(1) }}>
      <H4>
        <FormattedMessage defaultMessage={'Organic APY:'} />
        &nbsp;
      </H4>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <InfoTooltip
          onMouseEnter={() =>
            trackEvent(TRACKING_EVENTS.TOOL_TIP, {
              path: pathname,
              type: TRACKING_EVENTS.HOVER_TOOL_TIP,
              title: 'Organic APY',
            })
          }
          iconColor={theme.palette.typography.accent}
          iconSize={theme.spacing(2)}
          sx={{ marginRight: theme.spacing(1) }}
          toolTipText={defineMessage({
            defaultMessage: 'APY without incentives',
          })}
        />
      </Box>

      <Subtitle
        sx={{
          marginRight: theme.spacing(2),
          color:
            organicAPY !== undefined && organicAPY < 0
              ? theme.palette.error.main
              : theme.palette.typography.light,
        }}
      >
        {organicAPY !== undefined ? (
          <CountUp value={organicAPY} suffix="%" decimals={2} delay={0.3} />
        ) : (
          '-'
        )}
      </Subtitle>
      {liquidityYieldData?.incentives?.map((incentive) => (
        <>
          <H4>
            <FormattedMessage
              defaultMessage={'{symbol} APY:'}
              values={{ symbol: incentive.symbol }}
            />
            &nbsp;
          </H4>
          <Subtitle sx={{ color: theme.palette.typography.light }}>
            {incentive.incentiveAPY !== undefined ? (
              <CountUp
                value={incentive.incentiveAPY}
                suffix="%"
                decimals={2}
                delay={0.3}
              />
            ) : (
              '-'
            )}
          </Subtitle>
        </>
      ))}
    </Box>
  );
};
