import { useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
  FeatureLoader,
  Footer,
  TrackingConsent,
} from '@notional-finance/shared-web';
import {
  Header,
  MetaTagManager,
  metaTagData,
} from '@notional-finance/shared-web';
import {
  NotionalContext,
  useGlobalContext,
} from '@notional-finance/notionable-hooks';
import { WalletSelector } from '@notional-finance/wallet';
import { Box, CssBaseline, styled } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { META_TAG_CATEGORIES, RouteType } from '@notional-finance/util';
import {
  InitIntercom,
  InitSanctionsBlock,
  InitPageTrack,
} from './InitComponents';

interface AppLayoutRouteProps {
  component: React.ComponentType<unknown>;
  path: string;
  routeType: RouteType;
  landingLayout?: boolean;
}

const AppLayoutRoute = ({
  component: Component,
  path,
  routeType,
}: AppLayoutRouteProps) => {
  const globalState = useGlobalContext();
  const {
    global: { themeVariant },
  } = globalState;
  const params = useParams();
  const notionalTheme = useNotionalTheme(themeVariant);
  const slicedPath = path
    .match(/\/[^/]+/)?.[0]
    ?.slice(1) as META_TAG_CATEGORIES;

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <NotionalContext.Provider value={globalState}>
        <FeatureLoader>
          <TrackingConsent />
          <InitIntercom />
          <InitPageTrack routeType={routeType} />
          <InitSanctionsBlock />
          <Box>
            {metaTagData[slicedPath] && (
              <MetaTagManager metaTagCategory={slicedPath} />
            )}
            <AppShell>
              <Header>
                <WalletSelector />
              </Header>

              <MainContent>
                <Component {...params} />
              </MainContent>
              <Footer />
            </AppShell>
          </Box>
        </FeatureLoader>
      </NotionalContext.Provider>
    </ThemeProvider>
  );
};

const AppShell = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
`;

const MainContent = styled('div')`
  padding-top: 67px;
  display: flex;
  flex-grow: 1;
  & > div {
    height: 100%;
    width: 100%;
  }
`;

export default AppLayoutRoute;
