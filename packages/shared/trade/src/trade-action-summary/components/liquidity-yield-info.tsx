import { Box, useTheme } from '@mui/material';
import { YieldData } from '@notional-finance/core-entities';
import { trackEvent } from '@notional-finance/helpers';
import { CountUp, H4, InfoTooltip, Subtitle } from '@notional-finance/mui';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

export const LiquidityYieldInfo = ({
  liquidityYieldData,
}: {
  liquidityYieldData: YieldData;
}) => {
  const theme = useTheme();
  const { pathname } = useLocation();
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
            liquidityYieldData?.interestAPY !== undefined &&
            liquidityYieldData?.interestAPY < 0
              ? theme.palette.error.main
              : theme.palette.typography.light,
        }}
      >
        {liquidityYieldData?.interestAPY !== undefined ? (
          <CountUp
            value={liquidityYieldData.interestAPY}
            suffix="%"
            delay={0.3}
          />
        ) : (
          '-'
        )}
      </Subtitle>
      <H4>
        <FormattedMessage
          defaultMessage={'{symbol} APY:'}
          values={{ symbol: liquidityYieldData?.noteIncentives?.symbol }}
        />
        &nbsp;
      </H4>
      {liquidityYieldData?.noteIncentives && (
        <Subtitle
          sx={{
            color: theme.palette.typography.light,
            marginRight: theme.spacing(2),
          }}
        >
          {liquidityYieldData?.noteIncentives &&
          (liquidityYieldData?.noteIncentives?.incentiveAPY || 0) > 0 ? (
            <CountUp
              value={liquidityYieldData?.noteIncentives.incentiveAPY}
              suffix="%"
              delay={0.3}
            />
          ) : (
            '-'
          )}
        </Subtitle>
      )}
      {liquidityYieldData?.secondaryIncentives && (
        <>
          <H4>
            <FormattedMessage
              defaultMessage={'{symbol} APY:'}
              values={{
                symbol: liquidityYieldData?.secondaryIncentives?.symbol,
              }}
            />
            &nbsp;
          </H4>
          <Subtitle sx={{ color: theme.palette.typography.light }}>
            {liquidityYieldData?.secondaryIncentives &&
            (liquidityYieldData?.secondaryIncentives?.incentiveAPY || 0) > 0 ? (
              <CountUp
                value={liquidityYieldData?.secondaryIncentives.incentiveAPY}
                suffix="%"
                delay={0.3}
              />
            ) : (
              '-'
            )}
          </Subtitle>
        </>
      )}
    </Box>
  );
};
