// material-ui
import { styled, useTheme, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiTooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

// type
import { ColorProps } from 'types/extended';

// ==============================|| TOOLTIP - VARIANT ||============================== //

interface TooltipStyleProps {
  color?: ColorProps | string;
  labelColor?: ColorProps | string;
  theme: Theme;
}

function getVariantStyle({ color, theme }: TooltipStyleProps) {
  let colorValue = color ? color : '';

  if (['primary', 'secondary', 'info', 'success', 'warning', 'error'].includes(colorValue)) {
    return {
      [`& .${tooltipClasses.tooltip}`]: {
        background: 'white',
        color: 'black',
        boxShadow: '0px 4px 10px rgba(20, 42, 74, 0.12)',
        padding: '16px'
      },
      [`& .${tooltipClasses.arrow}`]: {
        color: 'white'
      }
    };
  } else {
    return {
      [`& .${tooltipClasses.tooltip}`]: {
        background: 'white',
        color: 'black',
        boxShadow: '0px 4px 10px rgba(20, 42, 74, 0.12)',
        padding: '16px'
      },
      [`& .${tooltipClasses.arrow}`]: {
        color: 'white'
      }
    };
  }
}

// ==============================|| STYLED - TOOLTIP COLOR ||============================== //

interface StyleProps {
  theme: Theme;
  arrow: TooltipProps['arrow'];
  labelColor?: ColorProps | string;
  color?: ColorProps | string;
}

const TooltipStyle = styled(({ className, ...props }: TooltipProps) => <MuiTooltip {...props} classes={{ popper: className }} />, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'labelColor'
})(({ theme, color, labelColor }: StyleProps) => ({
  ...(color && getVariantStyle({ color, theme, labelColor }))
}));

// ==============================|| EXTENDED - TOOLTIP ||============================== //

interface Props extends TooltipProps {
  arrow?: boolean;
  color?: ColorProps | string;
  labelColor?: ColorProps | string;
  children: TooltipProps['children'];
}

export default function CustomTooltip({ children, arrow = true, labelColor = '', ...rest }: Props) {
  const theme = useTheme();
  return (
    <Box display="flex">
      <TooltipStyle arrow={arrow} {...rest} theme={theme} labelColor={labelColor}>
        {children}
      </TooltipStyle>
    </Box>
  );
}
