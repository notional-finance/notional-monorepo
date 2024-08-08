import { CompatRoute } from 'react-router-dom-v5-compat';
import { Box, CssBaseline, ThemeProvider, styled } from '@mui/material';
import { colors, useNotionalTheme } from '@notional-finance/styles';

import { useLocation } from 'react-router';
import { THEME_VARIANTS } from '@notional-finance/util';

const LandingLayoutRoute = ({
  component: Component,
  path,
}: {
  component: React.ElementType;
  path: string;
}) => {
  const location = useLocation();
  const notionalTheme = useNotionalTheme(THEME_VARIANTS.DARK);

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <CompatRoute
        path={path}
        key={location.hash}
        render={(matchProps: Record<string, unknown>) => (
          <LandingWrapper>
            <Component {...matchProps} />
          </LandingWrapper>
        )}
      />
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
