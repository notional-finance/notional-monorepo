import React from 'react';
import { useTheme } from '@mui/material';
import { styled, SxProps } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';

export interface DrawerProps {
  children: React.ReactNode;
  size: 'large' | 'small';
  sx?: SxProps;
}

const StyledDrawer = styled(Paper)(
  ({ theme }) => `
  height: 100%;
  background-color: ${theme.palette.background.paper};
  ${theme.breakpoints.down('md')} {
    display: flex;
    justify-content: center;
    width: 100%;

    &.MuiDrawer-paper, .MuiDrawer-paperAnchorRight, .MuiDrawer-docked {
      width: 100%;
      margin: 0 auto;
      position: static;

      border: ${theme.shape.borderStandard};
      border-radius: ${theme.shape.borderRadius()};
    }
  }
  ${theme.breakpoints.down('sm')} {
    border: none;
    box-shadow: none;
  }
`
);

const SidebarContainer = styled('div')`
  height: 100%;
`;

export function Drawer({ children, size, sx }: DrawerProps) {
  const width = size === 'large' ? '543px' : '400px';
  const theme = useTheme() as NotionalTheme;

  return (
    <StyledDrawer
      sx={{
        width,
        float: 'right',
        padding: {
          xs: theme.spacing(4, 2),
          sm: theme.spacing(4, 2),
          md: theme.spacing(6),
          lg: theme.spacing(6),
          xl: theme.spacing(6),
        },
        ...sx,
      }}
    >
      <SidebarContainer id="SidebarContainer" theme={theme}>
        {children}
      </SidebarContainer>
    </StyledDrawer>
  );
}

export default Drawer;
