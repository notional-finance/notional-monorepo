import { useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import {
  Header,
  MetaTagManager,
  metaTagData,
  FeatureLoader,
  Footer,
} from '@notional-finance/shared-web';
import { useRootStore, useAppStore } from '@notional-finance/notionable-hooks';
import WalletSelector from '@notional-finance/wallet';
import { Box, CssBaseline, styled } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { META_TAG_CATEGORIES, RouteType } from '@notional-finance/util';
import {
  InitIntercom,
  InitSanctionsBlock,
  InitPageTrack,
} from './InitComponents';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

interface AppLayoutRouteProps {
  component: React.ComponentType<unknown>;
  path: string;
  routeType: RouteType;
  isInjected?: boolean;
}

const AppLayoutRoute = ({
  component: Component,
  path,
  routeType,
  isInjected,
}: AppLayoutRouteProps) => {
  const { themeVariant } = useAppStore();
  const { setRoute } = useRootStore();
  const params = useParams();
  const notionalTheme = useNotionalTheme(themeVariant, 'product');
  const slicedPath = path
    .match(/\/[^/]+/)?.[0]
    ?.slice(1) as META_TAG_CATEGORIES;

  useEffect(() => {
    const formattedRoute =
      slicedPath && params.category
        ? `${slicedPath}-${params.category}`
        : slicedPath;
    setRoute(formattedRoute);
  }, [slicedPath, params.category, setRoute]);

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <FeatureLoader>
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

            <MainContent sx={isInjected ? { paddingTop: 0 } : {}}>
              <Component {...params} />
            </MainContent>
            <Footer />
          </AppShell>
        </Box>
      </FeatureLoader>
    </ThemeProvider>
  );
};

const AppShell = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
`;

const MainContent = styled('div')(
  ({ theme }) => `
  padding-top: 67px;
  display: flex;
  flex-grow: 1;
  & > div {
    height: 100%;
    width: 100%;
  }

  ${theme.breakpoints.down('sm')} {
    padding-top: 4.6rem;
  }
`
);

export default observer(AppLayoutRoute);
