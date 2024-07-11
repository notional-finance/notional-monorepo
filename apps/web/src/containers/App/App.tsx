import spindl from '@spindl-xyz/attribution';
import {
  useSanctionsBlock,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
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
import { Redirect, Route, Switch, useParams } from 'react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './RouteContainer';
import AppLayoutRoute from './AppLayoutRoute';
import { WagmiConfig } from '@notional-finance/wallet';
import LandingLayoutRoute from './LandingLayoutRoute';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  PointsDashboard,
  ContestLeaderBoard,
} from '../../containers/TradingContest';
import { Markets } from '../Markets';
import { AnalyticsViews } from '../AnalyticsViews';
import { NoteView } from '../NoteView';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';

const RedirectToDefaultNetwork = () => {
  const walletNetwork = useWalletConnectedNetwork();
  const { basePath } = useParams<{ basePath: string }>();
  return (
    <Redirect
      path={basePath}
      from={basePath}
      to={`${basePath}/${
        walletNetwork || getDefaultNetworkFromHostname(window.location.hostname)
      }`}
    />
  );
};

const AllRoutes = () => {
  useSanctionsBlock();

  return (
    <CompatRouter>
      <RouteContainer>
        <Switch>
          <AppLayoutRoute
            path="/borrow-fixed/:selectedNetwork/:selectedDepositToken"
            component={BorrowFixed}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/borrow-fixed/:selectedNetwork"
            component={BorrowFixedDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedNetwork/:selectedDepositToken"
            component={BorrowVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedNetwork"
            component={BorrowVariableDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-fixed/:selectedNetwork/:selectedDepositToken"
            component={LendFixed}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-fixed/:selectedNetwork"
            component={LendFixedDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-variable/:selectedNetwork/:selectedDepositToken"
            component={LendVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-variable/:selectedNetwork"
            component={LendVariableDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/liquidity-variable/:selectedNetwork/:selectedDepositToken"
            component={LiquidityVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-variable/:selectedNetwork"
            component={LiquidityVariableDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken/:selectedToken"
            component={LiquidityLeveraged}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-leveraged/:selectedNetwork/:action/:selectedDepositToken"
            component={LiquidityLeveraged}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-leveraged/:selectedNetwork"
            component={LiquidityLeveragedDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/vaults/:selectedNetwork/:vaultAddress/:action/:selectedToken"
            component={VaultView}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/vaults/:selectedNetwork/:vaultAddress/:action"
            component={VaultView}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/vaults/:selectedNetwork/:vaultAddress"
            component={VaultView}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/leveraged-yield-farming/:selectedNetwork"
            component={LeveragedYieldDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/leveraged-points-farming/:selectedNetwork"
            component={LeveragedPointsDashboard}
            routeType="Card"
          />
          <AppLayoutRoute
            path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken`}
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action`}
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken/:action/:selectedCollateralToken`}
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path="/portfolio/:selectedNetwork/:category/:sideDrawerKey"
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path="/portfolio/:selectedNetwork/:category/"
            component={PortfolioFeatureShell}
            routeType="Portfolio"
          />
          <AppLayoutRoute
            path="/portfolio/:selectedNetwork"
            component={PortfolioFeatureShell}
            routeType="Portfolio"
          />
          <AppLayoutRoute
            path="/markets"
            component={Markets}
            routeType="Analytics"
          />
          <AppLayoutRoute
            path="/stake/:selectedDepositToken"
            component={StakeNOTE}
            routeType="Note"
          />
          <AppLayoutRoute path="/note" component={NoteView} routeType="Note" />
          <AppLayoutRoute
            path="/analytics/:category"
            component={AnalyticsViews}
            routeType="Analytics"
          />
          <AppLayoutRoute
            path="/analytics"
            component={AnalyticsViews}
            routeType="Analytics"
          />
          <AppLayoutRoute
            path="/error"
            component={ServerError}
            routeType="Error"
          />
          <AppLayoutRoute
            path="/points-dashboard/:selectedNetwork"
            component={PointsDashboard}
            routeType="Contest"
          />
          <AppLayoutRoute
            path="/contest/:selectedNetwork"
            component={ContestHome}
            routeType="Contest"
          />
          <AppLayoutRoute
            path="/contest-rules/:selectedNetwork"
            component={ContestRules}
            routeType="Contest"
          />
          <AppLayoutRoute
            path="/contest-leaderboard/:selectedNetwork"
            component={ContestLeaderBoard}
            routeType="Contest"
          />
          <AppLayoutRoute
            path="/contest-sign-up/:selectedNetwork/:step/"
            component={ContestSignUp}
            routeType="Contest"
          />
          <AppLayoutRoute
            path="/contest-sign-up/:selectedNetwork"
            component={ContestSignUp}
            routeType="Contest"
          />
          <LandingLayoutRoute path="/terms" component={TermsView} />
          <LandingLayoutRoute path="/privacy" component={PrivacyView} />
          <LandingLayoutRoute path="/about" component={AboutUsView} />
          {/* Catches all the card pages that should be redirected to the default network */}
          <Route path="/:basePath">
            <RedirectToDefaultNetwork />
          </Route>
          <LandingLayoutRoute path="/" component={LandingPageView} />
        </Switch>
      </RouteContainer>
    </CompatRouter>
  );
};

export const App = () => {
  const intercomID = process.env['NX_INTERCOM_APP_ID'] as string;
  const spindlAPI = process.env['NX_SPINDL_API_KEY'] as string;

  spindl.configure({
    sdkKey: spindlAPI,
  });

  spindl.enableAutoPageViews();

  const queryClient = new QueryClient();

  return (
    <HelmetProvider>
      <Helmet>
        <link rel="icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Notional Finance - DeFi lending and leveraged yield</title>
        <meta content="Notional Finance - DeFi lending and leveraged yield" />
        <meta
          name="description"
          content="Lend, Borrow, and Earn Leveraged Yield with Fixed or Variable Rates"
        />
      </Helmet>
      <IntercomProvider appId={intercomID}>
        <WagmiProvider config={WagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <AllRoutes />
          </QueryClientProvider>
        </WagmiProvider>
      </IntercomProvider>
    </HelmetProvider>
  );
};
