import { useEffect } from 'react';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './RouteContainer';
import AppLayoutRoute from './AppLayoutRoute';
import LandingLayoutRoute from './LandingLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';
// Feature shell views
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import { PortfolioFeatureShell } from '@notional-finance/portfolio-feature-shell';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { TermsView } from '../../containers/TermsView';
import { PrivacyView } from '../../containers/PrivacyView';
import { StakeNOTE } from '../../containers/StakeNOTE';
import {
  LandingPageView,
  VaultPageView,
  PointsPageView,
} from '../../containers/Webflow/WebflowEmbed';
import { NoteView } from '../NoteView';
import {
  getDefaultNetworkFromHostname,
  ONE_MINUTE_MS,
} from '@notional-finance/util';
import { RootStoreContext } from '@notional-finance/notionable-hooks';
import { createRootStore } from '@notional-finance/notionable';
import {
  initializeTokenBalanceRegistry,
  refreshNetworkModels,
} from '@notional-finance/core-entities';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { VaultDefaultScreen } from '../TransactionScreen';

const RedirectToDefaultNetwork = () => {
  const selectedNetwork = useSelectedNetwork();
  const { basePath } = useParams<{ basePath: string }>();
  return (
    <Navigate
      to={`${basePath}/${
        selectedNetwork ||
        getDefaultNetworkFromHostname(window.location.hostname)
      }`}
      replace
    />
  );
};

const AllRoutes = observer(() => {
  const appStore = useAppStore();

  useEffect(() => {
    const models = initializeTokenBalanceRegistry();
    const disposer = reaction(
      () => models.every((m) => m.isReady()),
      (isReady) => {
        if (isReady) {
          appStore.setIsAppReady(true);
        }
      }
    );

    return () => disposer();
  }, [appStore]);

  return (
    <RouteContainer>
      <Routes>
        <Route
          path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken`}
          element={
            <AppLayoutRoute
              path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken`}
              component={PortfolioFeatureShell}
              routeType="PortfolioTransaction"
            />
          }
        />
        <Route
          path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action`}
          element={
            <AppLayoutRoute
              path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action`}
              component={PortfolioFeatureShell}
              routeType="PortfolioTransaction"
            />
          }
        />
        <Route
          path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action/:selectedCollateralToken`}
          element={
            <AppLayoutRoute
              path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action/:selectedCollateralToken`}
              component={PortfolioFeatureShell}
              routeType="PortfolioTransaction"
            />
          }
        />
        <Route
          path="/portfolio/:selectedNetwork/:category/:sideDrawerKey"
          element={
            <AppLayoutRoute
              path="/portfolio/:selectedNetwork/:category/:sideDrawerKey"
              component={PortfolioFeatureShell}
              routeType="PortfolioTransaction"
            />
          }
        />
        <Route
          path="/portfolio/:selectedNetwork/:category/"
          element={
            <AppLayoutRoute
              path="/portfolio/:selectedNetwork/:category/"
              component={PortfolioFeatureShell}
              routeType="Portfolio"
            />
          }
        />
        <Route
          path="/portfolio/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/portfolio/:selectedNetwork"
              component={PortfolioFeatureShell}
              routeType="Portfolio"
            />
          }
        />
        <Route
          path="/stake/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/stake/:selectedDepositToken"
              component={StakeNOTE}
              routeType="Note"
            />
          }
        />
        <Route
          path="/vault/:selectedNetwork/:vaultAddress/*"
          element={
            <AppLayoutRoute
              path="/vault/:selectedNetwork/:vaultAddress"
              component={VaultDefaultScreen}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/vault/:selectedNetwork/:vaultAddress"
          element={
            <AppLayoutRoute
              path="/vault/:selectedNetwork/:vaultAddress"
              component={VaultDefaultScreen}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/vaults"
          element={
            <AppLayoutRoute
              path="/vaults"
              component={VaultPageView}
              routeType="Card"
            />
          }
        />
        <Route
          path="/points"
          element={
            <AppLayoutRoute
              path="/points"
              component={PointsPageView}
              routeType="Card"
            />
          }
        />
        <Route
          path="/note"
          element={
            <AppLayoutRoute
              path="/note"
              component={NoteView}
              routeType="Note"
            />
          }
        />
        <Route
          path="/error"
          element={
            <AppLayoutRoute
              path="/error"
              component={ServerError}
              routeType="Error"
            />
          }
        />
        <Route
          path="/terms"
          element={<LandingLayoutRoute component={TermsView} />}
        />
        <Route
          path="/privacy"
          element={<LandingLayoutRoute component={PrivacyView} />}
        />
        <Route
          path="/about"
          element={<LandingLayoutRoute component={AboutUsView} />}
        />
        <Route path="/:basePath" element={<RedirectToDefaultNetwork />} />
        <Route
          path="/"
          element={<LandingLayoutRoute component={LandingPageView} />}
        />
      </Routes>
    </RouteContainer>
  );
});

export const App = () => {
  const rootStore = createRootStore();

  useEffect(() => {
    const refreshNetworks = refreshNetworkModels();
    const refreshPortfolio = setInterval(() => {
      rootStore.walletStore.refreshPortfolio();
    }, ONE_MINUTE_MS);
    return () => {
      clearInterval(refreshNetworks);
      clearInterval(refreshPortfolio);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HelmetProvider>
      <RootStoreContext.Provider value={rootStore}>
        <Helmet>
          <link rel="icon" href="/favicon.svg" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Notional Finance - DeFi lending and leveraged yield</title>
          <meta
            name="title"
            content="Notional Finance - DeFi lending and leveraged yield"
          />
          <meta
            name="description"
            content="Lend, Borrow, and Earn Leveraged Yield with Fixed or Variable Rates"
          />
        </Helmet>
        <Web3OnboardProvider web3Onboard={OnboardContext}>
          <AllRoutes />
        </Web3OnboardProvider>
      </RootStoreContext.Provider>
    </HelmetProvider>
  );
};
