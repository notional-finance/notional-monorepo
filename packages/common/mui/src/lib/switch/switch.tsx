import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps, useTheme } from '@mui/material';

/* eslint-disable-next-line */
export interface SwitchProps extends MuiSwitchProps {}

export function Switch({ sx = {}, checked = false, ...rest }: SwitchProps) {
  const theme = useTheme();
  const defaults = {
    width: 32,
    height: 20,
    padding: 0,
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 17,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)',
      },
    },
    '& .MuiSwitch-switchBase': {
      padding: '2px',
      '&.Mui-checked': {
        transform: 'translateX(12px)',
        color: theme.palette.common.white,
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: theme.palette.primary.light ?? theme.palette.error.main,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      color: checked ? theme.palette.common.white : theme.palette.borders.accentPaper,
      width: 15,
      height: 15,
      borderRadius: 6,
      transition: theme.transitions.create(['width'], {
        duration: 200,
      }),
    },
    '& .MuiSwitch-track': {
      borderRadius: '1.25rem',
      border: `1px solid ${theme.palette.borders.accentPaper}`,
      opacity: 1,
      backgroundColor: theme.palette.common.white,
      boxSizing: 'border-box',
    },
  };
  return <MuiSwitch checked={checked} sx={{ ...defaults, ...sx }} {...rest} />;
}

export default Switch;
