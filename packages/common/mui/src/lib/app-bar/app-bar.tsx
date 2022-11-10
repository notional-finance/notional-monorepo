import { AppBar as MuiAppBar, AppBarProps as MuiAppBarProps } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

export interface AppBarProps extends MuiAppBarProps {
  children: ReactNode;
}

export const AppBar = ({ children, ...rest }: AppBarProps) => {
  const theme = useTheme() as NotionalTheme;

  return (
    <MuiAppBar
      sx={{
        zIndex: '1201',
        paddingRight: '0px',
        '&.MuiAppBar-root': {
          height: '4.6rem',
          background: theme.palette.background.default,
          borderBottom: theme.shape.borderStandard,
        },
      }}
      {...rest}
    >
      {children}
    </MuiAppBar>
  );
};

export default AppBar;
