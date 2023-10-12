import { CompatRoute } from 'react-router-dom-v5-compat';
import { Footer, Header } from '@notional-finance/shared-web';
import { WalletSelector } from '@notional-finance/wallet';
import { Box, styled } from '@mui/material';
import { RouteType } from '@notional-finance/util';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { usePageTrack } from '@notional-finance/helpers';
import { useLocation } from 'react-router';

const AppLayoutRoute = ({
  component: Component,
  path,
  routeType,
}: {
  component: React.ElementType;
  path: string;
  routeType: RouteType;
}) => {
  const location = useLocation();
  const selectedNetwork = useSelectedNetwork();
  usePageTrack(routeType, selectedNetwork);

  return (
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

const AppShell = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding-top: 67px;

  @media (max-width: 1440px) {
    padding-top: 51px;
  },

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
