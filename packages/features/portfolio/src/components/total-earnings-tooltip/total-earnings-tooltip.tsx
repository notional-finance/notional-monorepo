import { H5, InfoTooltip } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface TotalEarningsTooltipProps {
  toolTipData: {
    perAssetEarnings?: { underlying: string; baseCurrency: string }[];
    totalEarnings?: {
      totalBaseEarnings: string;
      totalIncentiveEarningsInBase: string;
    };
  };
}

interface FirstValueProps {
  theme: NotionalTheme;
  isNegative?: boolean;
}

export const TotalEarningsTooltip = ({
  toolTipData,
}: TotalEarningsTooltipProps) => {
  const theme = useTheme();
  const { pathname } = useLocation();

  const HoverComponent = () => {
    return (
      <div>
        {toolTipData?.totalEarnings ? (
          <Box>
            <FirstValue
              theme={theme}
              sx={{ display: 'flex', marginBottom: theme.spacing(1) }}
            >
              <FormattedMessage defaultMessage={'ORGANIC '} />
              <FirstValue
                sx={{ marginLeft: theme.spacing(1) }}
                theme={theme}
                isNegative={toolTipData?.totalEarnings.totalBaseEarnings?.includes(
                  '-'
                )}
              >
                {toolTipData?.totalEarnings.totalBaseEarnings}
              </FirstValue>
            </FirstValue>

            <FirstValue
              theme={theme}
              isNegative={toolTipData?.totalEarnings.totalIncentiveEarningsInBase?.includes(
                '-'
              )}
              sx={{ display: 'flex' }}
            >
              <Box sx={{ marginRight: theme.spacing(1) }}>
                <FormattedMessage defaultMessage={'INCENTIVE '} />
              </Box>
              {toolTipData?.totalEarnings.totalIncentiveEarningsInBase}
            </FirstValue>
          </Box>
        ) : (
          <Box>
            {toolTipData?.perAssetEarnings?.map((asset, index) =>
              asset.underlying ? (
                <ValueContainer
                  key={index}
                  sx={{ marginTop: index === 0 ? 0 : theme.spacing(1) }}
                >
                  <>
                    <FirstValue
                      theme={theme}
                      isNegative={asset.underlying?.includes('-')}
                    >
                      {asset.underlying}
                    </FirstValue>
                    <H5>({asset.baseCurrency})</H5>
                  </>
                </ValueContainer>
              ) : null
            )}
          </Box>
        )}
      </div>
    );
  };

  return (
    <InfoTooltip
      onMouseEnter={() =>
        trackEvent(TRACKING_EVENTS.TOOL_TIP, {
          path: pathname,
          type: TRACKING_EVENTS.HOVER_TOOL_TIP,
          title: 'total earnings tooltip',
        })
      }
      sx={{ marginLeft: theme.spacing(1) }}
      iconColor={theme.palette.typography.accent}
      ToolTipComp={HoverComponent}
      iconSize={theme.spacing(2)}
    />
  );
};

const ValueContainer = styled(Box)(`
  display: flex;
  flex-direction: row;
  justify-content: end;
`);

const FirstValue = styled(H5, {
  shouldForwardProp: (prop: string) => prop !== 'isNegative',
})(
  ({ theme, isNegative }: FirstValueProps) => `
  margin-right: ${theme.spacing(1)};
  color: ${
    isNegative ? theme.palette.error.main : theme.palette.typography.main
  };
`
);

export default TotalEarningsTooltip;
