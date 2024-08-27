import { useState } from 'react';
import { Box, styled, useTheme, Collapse } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { SideNavOptons } from './side-nav-options';
import { useAppStore } from '@notional-finance/notionable-hooks';

interface CollapsibleProps {
  theme: NotionalTheme;
  open: boolean;
  sideboxshadow: string;
}

export const SideNav = () => {
  const theme = useTheme();
  const { themeVariant } = useAppStore();
  const [open, setOpen] = useState(false);
  const sideBoxShadow =
    themeVariant === 'dark'
      ? '0px 34px 50px -15px rgba(51, 248, 255, 0.40)'
      : '0px 34px 50px -15px rgba(20, 42, 74, 0.40)';

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
        sideboxshadow={sideBoxShadow}
      >
        <Collapse orientation="horizontal" in={open} collapsedSize={80}>
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
  padding-top: ${theme.spacing(13.5)};
  ${theme.breakpoints.down('xxl')} {
    display: none;
  }
`
);

// NOTE* this unique padding-top is necessary to align with the button bar
const Collapsible = styled(Box)(
  ({ theme, open, sideboxshadow }: CollapsibleProps) => `  
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding-top: ${theme.spacing(22.375)};
  background: ${theme.palette.background.paper};
  border-right: ${theme.shape.borderStandard};
  z-index: 4;
  box-shadow: ${open ? sideboxshadow : 'none'};
  ${theme.breakpoints.up('xxl')} {
    display: none;
  }
`
);

export default SideNav;
