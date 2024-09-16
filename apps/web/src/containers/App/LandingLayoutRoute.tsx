import { Box, CssBaseline, ThemeProvider, styled } from '@mui/material';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';

interface LandingLayoutRouteProps {
  component: React.ComponentType<unknown>;
}

const LandingLayoutRoute = ({
  component: Component,
}: LandingLayoutRouteProps) => {
  const notionalTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <LandingWrapper>
        <Component />
      </LandingWrapper>
    </ThemeProvider>
  );
};

const LandingWrapper = styled(Box)(
  `
  width: 100%;
  min-height: 100vh;
  background: ${colors.black};
`
);

export default LandingLayoutRoute;
