import { CompatRoute } from 'react-router-dom-v5-compat';
import { Footer, Header } from '@notional-finance/shared-web';
import { WalletSelector } from '@notional-finance/wallet';
import { Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { RouteType } from '@notional-finance/util';
import { useWalletConnectedNetwork } from '@notional-finance/notionable-hooks';
import { usePageTrack } from '@notional-finance/helpers';
import { useLocation } from 'react-router';

const AppLayoutRoute = ({
  component: Component,
  path,
  routeType,
  landingLayout,
}: {
  component: React.ElementType;
  path: string;
  routeType: RouteType;
  landingLayout?: boolean;
}) => {
  const location = useLocation();
  const selectedNetwork = useWalletConnectedNetwork();
  usePageTrack(routeType, selectedNetwork);

  return landingLayout ? (
    <CompatRoute
      path={path}
      key={location.hash}
      render={(matchProps: Record<string, unknown>) => (
        <LandingWrapper>
          <Component {...matchProps} />
        </LandingWrapper>
      )}
    />
  ) : (
    <CompatRoute
      path={path}
      key={location.hash}
      render={(matchProps: Record<string, unknown>) => (
        <Box>
          <AppShell>
            <Header>
              <WalletSelector />
            </Header>

            <MainContent>
              <Component {...matchProps} />
            </MainContent>
            <StyledFooter />
          </AppShell>
        </Box>
      )}
    />
  );
};

const LandingWrapper = styled(Box)(
  `
  width: 100%;
  min-height: 100vh;
  background: ${colors.black};
`
);

const AppShell = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding-top: 67px;
`;

const MainContent = styled('div')`
  display: flex;
  flex-grow: 1;
  & > div {
    height: 100%;
    width: 100%;
  }
`;

const StyledFooter = styled(Footer)({});

export default AppLayoutRoute;
