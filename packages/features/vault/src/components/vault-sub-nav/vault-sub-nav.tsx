import { styled, Box, useTheme } from '@mui/material';
import { Link } from 'react-scroll';
import { Label, ExternalLink } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { NotionalTheme, useNotionalTheme } from '@notional-finance/styles';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { useVaultSubNav } from './use-vault-sub-nav';

interface NavItemProps {
  theme: NotionalTheme;
  reverseTheme: NotionalTheme;
}

export const VaultSubNav = () => {
  const theme = useTheme();
  const { themeVariant } = useUserSettingsState();
  const subNavData = useVaultSubNav();

  const customThemeVariant =
    themeVariant === THEME_VARIANTS.LIGHT
      ? THEME_VARIANTS.DARK
      : THEME_VARIANTS.LIGHT;

  const reverseTheme = useNotionalTheme(customThemeVariant);

  return (
    <MainContainer>
      <NavItemContainer>
        {subNavData.map(({ label, key, callback, anchor, href }) => {
          return (
            <NavItem key={key} theme={theme} reverseTheme={reverseTheme}>
              {callback && (
                <Label sx={{ padding: theme.spacing(0, 2) }} onClick={callback}>
                  {label}
                </Label>
              )}
              {anchor && (
                <Link
                  key={key}
                  activeClass="active"
                  to={anchor}
                  smooth={true}
                  spy={true}
                  duration={400}
                  offset={-200}
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
  width: 543px;
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
  .active {
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
      clip-path: polygon(100% 100%, 0 100%, 50% 50%);
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
  min-width: ${theme.spacing(94)};
  ${theme.breakpoints.down('lg')} {
    margin: ${theme.spacing(0, 2)};
  }
  ${theme.breakpoints.up('lg')} {
    max-width: 1000px;
    margin: 0px auto;
  }
`
);

const MainContainer = styled(Box)(
  ({ theme }) => `
  width: 100vw;
  height: ${theme.spacing(6)};
  top: 74px;
  position: fixed;
  z-index: 1;
  display: flex;
  background: ${theme.palette.background.accentDefault};
  ${theme.breakpoints.up('lg')} {
    padding: ${theme.spacing(0, 8)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);
