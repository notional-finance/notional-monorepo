import { InfoIcon } from '@notional-finance/icons';
import { Caption } from '../typography/typography';
import {
  useTheme,
  Tooltip,
  Box,
  SxProps,
  styled,
  tooltipClasses,
  TooltipProps,
} from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import React from 'react';

/* eslint-disable-next-line */
export interface InfoTooltipProps {
  ToolTipComp?: React.FC;
  toolTipText?: MessageDescriptor;
  sx?: SxProps;
  iconColor?: string;
  iconSize?: string;
  onMouseEnter?: () => void;
  InfoComponent?: React.ElementType;
  disableMaxWidth?: boolean;
}

interface StyledTooltipProps extends TooltipProps {
  disableMaxWidth?: boolean;
}

export function InfoTooltip({
  ToolTipComp,
  toolTipText,
  sx,
  iconColor,
  iconSize,
  onMouseEnter,
  InfoComponent,
  disableMaxWidth,
}: InfoTooltipProps) {
  const theme = useTheme();
  const iconSizes = iconSize ? iconSize : theme.typography.caption.fontSize;
  return (
    <StyledToolTip
      onMouseEnter={onMouseEnter}
      arrow
      disableMaxWidth={disableMaxWidth}
      title={ToolTipComp ? <ToolTipComp /> : <Caption msg={toolTipText} />}
    >
      {InfoComponent ? (
        <Box>
          <InfoComponent />
        </Box>
      ) : (
        <Box
          component="span"
          sx={{ width: iconSizes, height: iconSizes, display: 'flex', ...sx }}
        >
          <InfoIcon
            fill={iconColor ? iconColor : theme.palette.borders.accentPaper}
            sx={{ fontSize: iconSizes }}
          />
        </Box>
      )}
    </StyledToolTip>
  );
}

const StyledToolTip = styled(({ className, ...props }: StyledTooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme, disableMaxWidth }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    boxShadow: '-2px 0px 24px 0px #1429661A, 0px 3px 11px 0px #1D74771F',
    borderRadius: theme.shape.borderRadius(),
    maxWidth: disableMaxWidth ? 'none' : theme.spacing(37),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
}));

export default InfoTooltip;
