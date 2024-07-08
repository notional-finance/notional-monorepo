import { styled, Box, useTheme, ThemeProvider } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { StyledButton } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useNotionalTheme } from '@notional-finance/styles';
import { useCardSubNav } from './use-card-sub-nav';

export const CardSubNav = () => {
  const theme = useTheme();
  const location = useLocation();
  const { pathname } = location;
  const themeLanding = useNotionalTheme(THEME_VARIANTS.DARK, 'landing');
  const leveredUp =
    pathname.includes('leveraged') || pathname.includes('vaults');
  const { links, leveragedLinks } = useCardSubNav();

  return (
    <ThemeProvider theme={themeLanding}>
      <StyledContainer>
        {leveredUp
          ? leveragedLinks.map(({ title, to, key }, i) => (
              <StyledButton
                key={i}
                to={to}
                variant="outlined"
                active={pathname.includes(key)}
                theme={theme}
              >
                {title}
              </StyledButton>
            ))
          : links.map(({ title, to, key }, i) => (
              <StyledButton
                key={i}
                to={to}
                variant="outlined"
                active={pathname.includes(key)}
                theme={theme}
              >
                {title}
              </StyledButton>
            ))}
      </StyledContainer>
    </ThemeProvider>
  );
};

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
