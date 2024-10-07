import spindl from '@spindl-xyz/attribution';
import { useEffect } from 'react';
import { useWalletConnectedNetwork } from '@notional-finance/notionable-hooks';
import { IntercomProvider } from 'react-use-intercom';
import {
  LeveragedYieldDashboard,
  LeveragedPointsDashboard,
  LendFixedDashboard,
  BorrowFixedDashboard,
  LendVariableDashboard,
  BorrowVariableDashboard,
  LiquidityVariableDashboard,
  LiquidityLeveragedDashboard,
} from '@notional-finance/shared-web';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './RouteContainer';
import AppLayoutRoute from './AppLayoutRoute';
import LandingLayoutRoute from './LandingLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';
// Feature shell views
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import { LendFixed, LendVariable } from '@notional-finance/lend-feature-shell';
import { PortfolioFeatureShell } from '@notional-finance/portfolio-feature-shell';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import {
  BorrowFixed,
  BorrowVariable,
} from '@notional-finance/borrow-feature-shell';
import {
  LiquidityVariable,
  LiquidityLeveraged,
} from '@notional-finance/liquidity-feature-shell';
import { VaultView } from '@notional-finance/vault-feature-shell';
import { TermsView } from '../../containers/TermsView';
import { PrivacyView } from '../../containers/PrivacyView';
import { StakeNOTE } from '../../containers/StakeNOTE';
import { LandingPageView } from '../../containers/LandingPageView';
import {
  ContestHome,
  ContestRules,
  ContestSignUp,
  ContestLeaderBoard,
} from '../../containers/TradingContest';
import { Markets } from '../Markets';
import { AnalyticsViews } from '../AnalyticsViews';
import { NoteView } from '../NoteView';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';

const intercomID = process.env['NX_INTERCOM_APP_ID'] as string;
const spindlAPI = process.env['NX_SPINDL_API_KEY'] as string | undefined;

const RedirectToDefaultNetwork = () => {
  const walletNetwork = useWalletConnectedNetwork();
  const { basePath } = useParams<{ basePath: string }>();
  return (
    <Navigate
      to={`${basePath}/${
        walletNetwork || getDefaultNetworkFromHostname(window.location.hostname)
      }`}
      replace
    />
  );
};

const AllRoutes = () => {
  return (
    <RouteContainer>
      <Routes>
        <Route
          path="/borrow-fixed/:selectedNetwork/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/borrow-fixed/:selectedNetwork/:selectedDepositToken"
              component={BorrowFixed}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/borrow-fixed/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/borrow-fixed/:selectedNetwork"
              component={BorrowFixedDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/borrow-variable/:selectedNetwork/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/borrow-variable/:selectedNetwork/:selectedDepositToken"
              component={BorrowVariable}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/borrow-variable/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/borrow-variable/:selectedNetwork"
              component={BorrowVariableDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/lend-fixed/:selectedNetwork/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/lend-fixed/:selectedNetwork/:selectedDepositToken"
              component={LendFixed}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/lend-fixed/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/lend-fixed/:selectedNetwork"
              component={LendFixedDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/lend-variable/:selectedNetwork/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/lend-variable/:selectedNetwork/:selectedDepositToken"
              component={LendVariable}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/lend-variable/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/lend-variable/:selectedNetwork"
              component={LendVariableDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/liquidity-variable/:selectedNetwork/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/liquidity-variable/:selectedNetwork/:selectedDepositToken"
              component={LiquidityVariable}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/liquidity-variable/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/liquidity-variable/:selectedNetwork"
              component={LiquidityVariableDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken/:selectedToken"
          element={
            <AppLayoutRoute
              path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken/:selectedToken"
              component={LiquidityLeveraged}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken"
          element={
            <AppLayoutRoute
              path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken"
              component={LiquidityLeveraged}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/liquidity-leveraged/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/liquidity-leveraged/:selectedNetwork"
              component={LiquidityLeveragedDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/vaults/:selectedNetwork/:vaultAddress/:action/:selectedToken"
          element={
            <AppLayoutRoute
              path="/vaults/:selectedNetwork/:vaultAddress/:action/:selectedToken"
              component={VaultView}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/vaults/:selectedNetwork/:vaultAddress/:action"
          element={
            <AppLayoutRoute
              path="/vaults/:selectedNetwork/:vaultAddress/:action"
              component={VaultView}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/vaults/:selectedNetwork/:vaultAddress"
          element={
            <AppLayoutRoute
              path="/vaults/:selectedNetwork/:vaultAddress"
              component={VaultView}
              routeType="Transaction"
            />
          }
        />
        <Route
          path="/leveraged-yield-farming/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/leveraged-yield-farming/:selectedNetwork"
              component={LeveragedYieldDashboard}
              routeType="Card"
            />
          }
        />
        <Route
          path="/leveraged-points-farming/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/leveraged-points-farming/:selectedNetwork"
              component={LeveragedPointsDashboard}
              routeType="Card"
            />
          }
        />
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
          path="/markets"
          element={
            <AppLayoutRoute
              path="/markets"
              component={Markets}
              routeType="Analytics"
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
          path="/analytics/:category"
          element={
            <AppLayoutRoute
              path="/analytics/:category"
              component={AnalyticsViews}
              routeType="Analytics"
            />
          }
        />
        <Route
          path="/analytics"
          element={
            <AppLayoutRoute
              path="/analytics"
              component={AnalyticsViews}
              routeType="Analytics"
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
          path="/contest/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/contest/:selectedNetwork"
              component={ContestHome}
              routeType="Contest"
            />
          }
        />
        <Route
          path="/contest-rules/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/contest-rules/:selectedNetwork"
              component={ContestRules}
              routeType="Contest"
            />
          }
        />
        <Route
          path="/contest-leaderboard/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/contest-leaderboard/:selectedNetwork"
              component={ContestLeaderBoard}
              routeType="Contest"
            />
          }
        />
        <Route
          path="/contest-sign-up/:selectedNetwork/:step/"
          element={
            <AppLayoutRoute
              path="/contest-sign-up/:selectedNetwork/:step/"
              component={ContestSignUp}
              routeType="Contest"
            />
          }
        />
        <Route
          path="/contest-sign-up/:selectedNetwork"
          element={
            <AppLayoutRoute
              path="/contest-sign-up/:selectedNetwork"
              component={ContestSignUp}
              routeType="Contest"
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
};

export const App = () => {
  useEffect(() => {
    if (spindlAPI) {
      spindl.configure({
        sdkKey: spindlAPI,
      });

      spindl.enableAutoPageViews();
    }
  }, []);

  return (
    <HelmetProvider>
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
      <IntercomProvider appId={intercomID}>
        <Web3OnboardProvider web3Onboard={OnboardContext}>
          <AllRoutes />
        </Web3OnboardProvider>
      </IntercomProvider>
    </HelmetProvider>
  );
};
