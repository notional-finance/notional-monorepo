import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
  useTheme,
} from '@mui/material';
import { ReactNode } from 'react';

export interface AppBarProps extends MuiAppBarProps {
  children: ReactNode;
  showBorder?: boolean;
}

export const AppBar = ({
  children,
  showBorder = false,
  ...rest
}: AppBarProps) => {
  const theme = useTheme();
  return (
    <MuiAppBar
      sx={{
        zIndex: '1201',
        paddingRight: '0px',
        '&.MuiAppBar-root': {
          height: '4.6rem',
          marginTop: '0px',
          top: 'unset !important',
          borderBottom: showBorder ? theme.shape.borderStandard : '',
          background: showBorder
            ? theme.palette.background.default
            : 'transparent',
          boxShadow: 'none',
        },
      }}
      {...rest}
    >
      {children}
    </MuiAppBar>
  );
};

export default AppBar;
