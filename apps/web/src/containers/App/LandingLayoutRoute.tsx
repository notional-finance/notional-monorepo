import { Box, CssBaseline, ThemeProvider, styled } from '@mui/material';
import { useNewUserTracking } from '@notional-finance/helpers';
import { colors, useNotionalTheme } from '@notional-finance/styles';
import { THEME_VARIANTS } from '@notional-finance/util';
import { WalletSideDrawer } from '@notional-finance/wallet';

interface LandingLayoutRouteProps {
  component: React.ComponentType<unknown>;
}

const LandingLayoutRoute = ({
  component: Component,
}: LandingLayoutRouteProps) => {
  const notionalTheme = useNotionalTheme(THEME_VARIANTS.DARK);
  useNewUserTracking();

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <LandingWrapper>
        <WalletSideDrawer />
        <Component />
      </LandingWrapper>
    </ThemeProvider>
  );
};

const LandingWrapper = styled(Box)(`
  width: 100%;
  min-height: 100vh;
  background: ${colors.black};
`);

export default LandingLayoutRoute;
