import {
  NotionalContext,
  useGlobalContext,
  useSanctionsBlock,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import {
  FeatureLoader,
  TrackingConsent,
  DashboardView,
} from '@notional-finance/shared-web';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './RouteContainer';
import AppLayoutRoute from './AppLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ScrollToTop } from '@notional-finance/mui';
import { useConnect } from '@notional-finance/wallet/hooks';
import { useNotionalTheme } from '@notional-finance/styles';
// Feature shell views
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import {
  LendFixed,
  // LendLeveraged,
  LendVariable,
  LendCardView,
  LendVariableCardView,
  // LendLeveragedCardView,
} from '@notional-finance/lend-feature-shell';
import { PortfolioFeatureShell } from '@notional-finance/portfolio-feature-shell';
import {
  BorrowFixed,
  BorrowFixedCardView,
  BorrowVariable,
  BorrowVariableCardView,
} from '@notional-finance/borrow-feature-shell';
import {
  LiquidityVariable,
  LiquidityVariableCardView,
  LiquidityLeveraged,
} from '@notional-finance/liquidity-feature-shell';
import { VaultView } from '@notional-finance/vault-feature-shell';
import { TermsView } from '../../containers/TermsView';
import { PrivacyView } from '../../containers/PrivacyView';
import { LandingPageView } from '../../containers/LandingPageView';
import {
  ContestHome,
  ContestRules,
  ContestSignUp,
  ContestLeaderBoard,
} from '../../containers/TradingContest';
import { Markets } from '../Markets';
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
  // Have this hook here to ensure that all children routes will see updates if the onboard
  // context changes (there is a useEffect hook inside here listening for changes in the
  // onboard context)
  useConnect();

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
            component={BorrowFixedCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedNetwork/:selectedDepositToken"
            component={BorrowVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedNetwork"
            component={BorrowVariableCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-fixed/:selectedNetwork/:selectedDepositToken"
            component={LendFixed}
            routeType="Transaction"
          />
          {/* <AppLayoutRoute
            path="/lend-leveraged/:selectedDepositToken"
            component={LendLeveraged}
            routeType="Transaction"
          /> */}
          <AppLayoutRoute
            path="/lend-fixed/:selectedNetwork"
            component={LendCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-variable/:selectedNetwork/:selectedDepositToken"
            component={LendVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-variable/:selectedNetwork"
            component={LendVariableCardView}
            routeType="Card"
          />
          {/* <AppLayoutRoute
            path="/lend-leveraged"
            component={LendLeveragedCardView}
            routeType="Card"
          /> */}
          <AppLayoutRoute
            path="/liquidity-variable/:selectedNetwork/:selectedDepositToken"
            component={LiquidityVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-variable/:selectedNetwork"
            component={LiquidityVariableCardView}
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
            component={DashboardView}
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
            path="/vaults/:selectedNetwork"
            component={DashboardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path={`/portfolio/:selectedNetwork/:category/:sideDrawerKey/:selectedToken`}
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
            path="/markets/:selectedNetwork"
            component={Markets}
            routeType="Markets"
          />
          <AppLayoutRoute
            path="/error"
            component={ServerError}
            routeType="Error"
          />
          {/* <AppLayoutRoute
            path="/contest"
            component={ContestHome}
            routeType="Contest"
          /> */}
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
          <AppLayoutRoute
            path="/terms"
            component={TermsView}
            routeType="Landing"
          />
          <AppLayoutRoute
            path="/privacy"
            component={PrivacyView}
            routeType="Landing"
          />
          <AppLayoutRoute
            landingLayout
            path="/about"
            component={AboutUsView}
            routeType="Landing"
          />
          {/* <AppLayoutRoute path="/stake/:ethOrWeth" component={StakeView} />
          <AppLayoutRoute path="/stake" component={StakeView} />
          <AppLayoutRoute path="/unstake/:unstakePath" component={StakeView} />
          <AppLayoutRoute path="/unstake" component={StakeView} />
          <AppLayoutRoute path="/treasury" component={TreasuryView} /> */}

          {/* Catches all the card pages that should be redirected to the default network */}
          <Route path="/:basePath">
            <RedirectToDefaultNetwork />
          </Route>
          <AppLayoutRoute
            landingLayout
            path="/"
            component={LandingPageView}
            routeType="Landing"
          />
        </Switch>
        <TrackingConsent />
      </RouteContainer>
    </CompatRouter>
  );
};

export const App = () => {
  const globalState = useGlobalContext();

  const {
    state: { themeVariant },
  } = globalState;
  const notionalTheme = useNotionalTheme(themeVariant);

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <NotionalContext.Provider value={globalState}>
        <FeatureLoader>
          <Web3OnboardProvider web3Onboard={OnboardContext}>
            <ScrollToTop />
            <AllRoutes />
          </Web3OnboardProvider>
        </FeatureLoader>
      </NotionalContext.Provider>
    </ThemeProvider>
  );
};
