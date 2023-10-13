import { useState } from 'react';
import { Box, styled, useTheme, Collapse } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { SideNavOptons } from './side-nav-options';

interface CollapsibleProps {
  theme: NotionalTheme;
  open: boolean;
}

export const SideNav = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <NonCollapsible>
        <SideNavOptons />
      </NonCollapsible>
      <Collapsible
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        theme={theme}
        open={open}
      >
        <Collapse orientation="horizontal" in={open} collapsedSize={64}>
          <SideNavOptons open={open} />
        </Collapse>
      </Collapsible>
    </>
  );
};

const NonCollapsible = styled(Box)(
  ({ theme }) => `
  position: fixed;
  width: inherit;
  ${theme.breakpoints.down('xl')} {
    display: none;
  }
`
);

// NOTE* this unique padding-top is necessary to align with the button bar
const Collapsible = styled(Box)(
  ({ theme, open }: CollapsibleProps) => `  
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding-top: 154px;
  padding-left: ${theme.spacing(3)};
  background: ${theme.palette.background.default};
  z-index: 4;
  padding-right: ${theme.spacing(3)};  
  box-shadow: ${open ? '34px 0 50px -2px rgba(20, 42, 74, 0.3)' : 'none'};
  ${theme.breakpoints.up('xl')} {
    display: none;
  }
`
);

export default SideNav;
