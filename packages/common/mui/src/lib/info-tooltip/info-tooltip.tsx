import { InfoIcon } from '@notional-finance/icons';
import { MessageDescriptor } from 'react-intl';
import {
  useTheme,
  Tooltip,
  Box,
  SxProps,
  styled,
  tooltipClasses,
  TooltipProps,
} from '@mui/material';
import { Caption } from '../typography/typography';

/* eslint-disable-next-line */
export interface InfoTooltipProps {
  toolTipText: MessageDescriptor;
  sx?: SxProps;
}

export function InfoTooltip({ toolTipText, sx }: InfoTooltipProps) {
  const theme = useTheme();
  const iconSize = theme.typography.caption.fontSize;

  return (
    <StyledToolTip arrow title={<Caption msg={toolTipText} />}>
      <Box component="span" sx={{ width: iconSize, height: iconSize, display: 'flex', ...sx }}>
        <InfoIcon sx={{ fontSize: iconSize, color: theme.palette.borders.accentPaper }} />
      </Box>
    </StyledToolTip>
  );
}

const StyledToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    padding: '8px 16px',
    backgroundColor: theme.palette.common.white,
    boxShadow: '-2px 0px 24px 0px #1429661A, 0px 3px 11px 0px #1D74771F',
    borderRadius: theme.shape.borderRadius(),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
  },
}));

export default InfoTooltip;
