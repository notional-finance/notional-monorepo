import { styled, Box, useTheme, ThemeProvider } from '@mui/material';
import { useLocation, useHistory } from 'react-router-dom';
import { colors, NotionalTheme } from '@notional-finance/styles';
import { Button, LeverUpToggle } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import { useCardSubNav } from './use-card-sub-nav';

interface StyledButtonProps {
  active: boolean;
  theme: NotionalTheme;
}

export const CardSubNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const themeLanding = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const history = useHistory();
  const leveredUp =
    pathname.includes('leveraged') || pathname.includes('vaults');
  const { links, leveragedLinks } = useCardSubNav();

  const handleLeverUpToggle = () => {
    const routes = {
      '/lend-fixed': '/lend-leveraged',
      '/lend-variable': '/lend-leveraged',
      '/lend-leveraged': '/lend-fixed',
      '/liquidity-variable': '/liquidity-leveraged',
      '/liquidity-leveraged': '/liquidity-variable',
      '/vaults': '/lend-fixed',
    };
    history.push(routes[pathname]);
  };

  return (
    <ThemeProvider theme={themeLanding}>
      <StyledContainer>
        {!pathname.includes('borrow') && (
          <LeverUpToggle
            leveredUp={leveredUp}
            altBackground={true}
            handleLeverUpToggle={handleLeverUpToggle}
          />
        )}

        {leveredUp
          ? leveragedLinks.map(({ title, to }, i) => (
              <StyledButton
                key={i}
                to={to}
                variant="outlined"
                active={to === pathname}
                theme={theme}
              >
                {title}
              </StyledButton>
            ))
          : links.map(({ title, to }, i) => (
              <StyledButton
                key={i}
                to={to}
                variant="outlined"
                active={to === pathname}
                theme={theme}
              >
                {title}
              </StyledButton>
            ))}
      </StyledContainer>
    </ThemeProvider>
  );
};

const StyledButton = styled(Button, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active, theme }: StyledButtonProps) => `
    color: ${active ? colors.black : colors.white};
    background: ${active ? colors.neonTurquoise : colors.black};
    border: 1px solid ${colors.neonTurquoise};
    font-weight: 500;
    

    &:hover {
      transition: all .3s ease;
        background: ${active ? colors.neonTurquoise : theme.palette.info.light};
        color: ${active ? colors.black : colors.white};
        border: 1px solid ${colors.neonTurquoise};
    }
`
);

const StyledContainer = styled(Box)(
  ({ theme }) => `
    grid-gap: ${theme.spacing(2)};
    display: flex;
    margin-bottom: ${theme.spacing(6)}; 
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
`
);

export default CardSubNav;
