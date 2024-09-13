import { useState } from 'react';
import { styled, Box, useTheme } from '@mui/material';
import { Link } from 'react-scroll';
import { Label, ExternalLink } from '@notional-finance/mui';
import { THEME_VARIANTS, VAULT_SUB_NAV_ACTIONS } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable';
import { NotionalTheme, useNotionalTheme } from '@notional-finance/styles';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { useVaultSubNav } from './use-vault-sub-nav';
interface NavItemProps {
  theme: NotionalTheme;
  reverseTheme: NotionalTheme;
}

export const VaultSubNav = () => {
  const theme = useTheme();
  const { themeVariant } = useAppStore();
  const subNavData = useVaultSubNav();
  const [activeLink, setActiveLink] = useState<
    VAULT_SUB_NAV_ACTIONS | undefined
  >(VAULT_SUB_NAV_ACTIONS.OVERVIEW);
  const [userScrolling, setUserScrolling] = useState(false);

  const customThemeVariant =
    themeVariant === THEME_VARIANTS.LIGHT
      ? THEME_VARIANTS.DARK
      : THEME_VARIANTS.LIGHT;

  const reverseTheme = useNotionalTheme(customThemeVariant);

  const handleEvents = () => {
    if (userScrolling === false) {
      setUserScrolling(true);
    }
  };

  window.addEventListener('wheel', () => handleEvents());
  window.addEventListener('touchmove', () => handleEvents());
  window.addEventListener('mousedown', () => handleEvents());

  const handleActiveLink = (anchor?: VAULT_SUB_NAV_ACTIONS) => {
    setUserScrolling(false);
    setActiveLink(anchor);
  };

  const handleScrollChange = (anchor: VAULT_SUB_NAV_ACTIONS) => {
    if (userScrolling) {
      setActiveLink(anchor);
    }
  };

  return (
    <MainContainer>
      <NavItemContainer>
        {subNavData.map(({ label, key, callback, anchor, href }) => {
          return (
            <NavItem
              key={key}
              theme={theme}
              reverseTheme={reverseTheme}
              onClick={() => handleActiveLink(anchor)}
              className={
                activeLink === anchor && !callback && !href ? 'active' : ''
              }
            >
              {callback && (
                <Label
                  sx={{
                    padding: theme.spacing(0, 2),
                    display: 'flex',
                    height: '100%',
                    alignItems: 'center',
                  }}
                  onClick={() => {
                    setActiveLink(VAULT_SUB_NAV_ACTIONS.OVERVIEW);
                    callback();
                  }}
                >
                  {label}
                </Label>
              )}
              {anchor && key !== VAULT_SUB_NAV_ACTIONS.BACK_TO_TOP && (
                <Link
                  id="ANCHOR LINK"
                  key={key}
                  to={anchor}
                  smooth={true}
                  spy={true}
                  duration={400}
                  isDynamic={true}
                  offset={-130}
                  onClick={() => handleActiveLink(anchor)}
                  onSetActive={() => handleScrollChange(anchor)}
                >
                  <Box>{label}</Box>
                  <span className="span1"></span>
                  <span className="span2"></span>
                </Link>
              )}
              {href && (
                <ExternalLink
                  href={href}
                  accent
                  textDecoration
                  style={{
                    whiteSpace: 'nowrap',
                    textDecorationColor: reverseTheme.palette.typography.accent,
                  }}
                >
                  <Label
                    sx={{
                      color: reverseTheme.palette.typography.accent,
                    }}
                  >
                    {label}
                  </Label>
                  <ExternalLinkIcon
                    sx={{
                      height: '12px',
                      color: reverseTheme.palette.typography.accent,
                    }}
                  />
                </ExternalLink>
              )}
            </NavItem>
          );
        })}
      </NavItemContainer>
      <HiddenSidebar></HiddenSidebar>
    </MainContainer>
  );
};

const HiddenSidebar = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(68)};
  background: transparent;
  ${theme.breakpoints.down('md')} {
    display: none;
  }
`
);

const NavItem = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'reverseTheme',
})(
  ({ theme, reverseTheme }: NavItemProps) => `
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  white-space: nowrap;
  color: ${theme.palette.typography.contrastText};
  border-right: ${reverseTheme.shape.borderStandard};

  a {
    padding: ${theme.spacing(0, 2)};
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  } 
  
   &.active {
     height: 100%;
     background: ${theme.palette.info.light};
     color: ${reverseTheme.palette.typography.accent};
     width: 100%;
     display: flex;
     align-items: center;
     justify-content: center;
     font-weight: ${theme.typography.fontWeightMedium};
    
     .span1, .span2 {
       width: ${theme.spacing(3)};
       height: ${theme.spacing(2.5)};
       position: fixed;
       margin-top: ${theme.spacing(8.375)};
       clipPath: polygon(100% 100%, 0 100%, 50% 50%);
       transform: rotate(180deg);
       background: ${theme.palette.background.accentDefault};
     }
     .span2 {
       background: ${theme.palette.info.light};
     }
   }


  &:last-child {
    border-right: none;
  }
`
);

const NavItemContainer = styled(Box)(
  ({ theme }) => `
  flex: 1;
  display: flex;
  background: ${theme.palette.background.accentDefault};
  padding: ${theme.spacing(0, 8)};
  min-width: ${theme.spacing(100)};
`
);

const MainContainer = styled(Box)(
  ({ theme }) => `
  width: 100vw;
  height: ${theme.spacing(6)};
  top: 74px;
  position: fixed;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);
