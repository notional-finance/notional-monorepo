import { H5, InfoTooltip } from '@notional-finance/mui';
import { NotionalTheme } from '@notional-finance/styles';
import { trackEvent } from '@notional-finance/helpers';
import { TRACKING_EVENTS } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface TotalEarningsTooltipProps {
  toolTipData: {
    nonNoteEarnings?: string;
    noteEarnings?: string;
    underlyingBaseCurrency?: string;
    underlying?: string;
    noteBaseCurrency?: string;
    note?: string;
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
  const {
    underlyingBaseCurrency,
    underlying,
    noteBaseCurrency,
    note,
    noteEarnings,
    nonNoteEarnings,
  } = toolTipData;

  const HoverComponent = () => {
    return (
      <div>
        {noteEarnings && nonNoteEarnings ? (
          <Box>
            <FirstValue
              theme={theme}
              isNegative={noteEarnings?.includes('-')}
              sx={{ display: 'flex' }}
            >
              <Box sx={{ marginRight: theme.spacing(1) }}>NOTE</Box>
              <Box>{noteEarnings}</Box>
            </FirstValue>
            <ValueContainer
              sx={{
                marginTop: theme.spacing(1),
              }}
            >
              <FirstValue theme={theme} sx={{ marginRight: theme.spacing(1) }}>
                <FormattedMessage defaultMessage={'ORGANIC '} />
              </FirstValue>
              <FirstValue
                theme={theme}
                isNegative={nonNoteEarnings?.includes('-')}
              >
                {nonNoteEarnings}
              </FirstValue>
            </ValueContainer>
          </Box>
        ) : (
          <>
            <ValueContainer sx={{ marginBottom: theme.spacing(1) }}>
              <FirstValue theme={theme} isNegative={underlying?.includes('-')}>
                {underlying}
              </FirstValue>
              <H5>({underlyingBaseCurrency})</H5>
            </ValueContainer>
            <ValueContainer>
              <FirstValue theme={theme} isNegative={note?.includes('-')}>
                {note}
              </FirstValue>
              <H5>({noteBaseCurrency})</H5>
            </ValueContainer>
          </>
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
