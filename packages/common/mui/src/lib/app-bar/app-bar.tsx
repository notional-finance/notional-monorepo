import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
} from '@mui/material';
import { ReactNode } from 'react';

export interface AppBarProps extends MuiAppBarProps {
  children: ReactNode;
}

export const AppBar = ({ children, ...rest }: AppBarProps) => {
  return (
    <MuiAppBar
      sx={{
        zIndex: '1201',
        paddingRight: '0px',
        '&.MuiAppBar-root': {
          height: '4.6rem',
          background: 'transparent',
        },
      }}
      {...rest}
    >
      {children}
    </MuiAppBar>
  );
};

export default AppBar;
