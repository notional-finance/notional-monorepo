import {
  NotionalContext,
  useGlobalContext,
  useSanctionsBlock,
} from '@notional-finance/notionable-hooks';
import { TrackingConsent } from '@notional-finance/shared-web';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { useEffect } from 'react';
import { Switch } from 'react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './components/RouteContainer';
import AppLayoutRoute from './layouts/AppLayoutRoute';
import LandingPageLayoutRoute from './layouts/LandingPageLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ScrollToTop } from '@notional-finance/mui';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';
import { useConnect } from '@notional-finance/wallet/hooks';
import { useNotionalTheme } from '@notional-finance/styles';
// Feature shell views
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import {
  LendFixed,
  LendLeveraged,
  LendVariable,
  LendCardView,
  LendVariableCardView,
  LendLeveragedCardView,
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
  LiquidityLeveragedCardView,
} from '@notional-finance/liquidity-feature-shell';
import {
  VaultView,
  VaultCardView,
} from '@notional-finance/vault-feature-shell';
import { TermsView } from '../../containers/TermsView';
import { PrivacyView } from '../../containers/PrivacyView';
import { LandingPageView } from '../../containers/LandingPageView';
import {
  ContestHome,
  ContestRules,
  ContestLeaderBoard,
} from '../../containers/TradingContest';
import { Markets } from '../Markets';

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
            path="/borrow-fixed/:selectedDepositToken"
            component={BorrowFixed}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/borrow-fixed"
            component={BorrowFixedCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedDepositToken"
            component={BorrowVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/borrow-variable"
            component={BorrowVariableCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-fixed/:selectedDepositToken"
            component={LendFixed}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-leveraged/:selectedDepositToken"
            component={LendLeveraged}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-fixed"
            component={LendCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-variable/:selectedDepositToken"
            component={LendVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/lend-variable"
            component={LendVariableCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/lend-leveraged"
            component={LendLeveragedCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/liquidity-variable/:selectedDepositToken"
            component={LiquidityVariable}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-variable"
            component={LiquidityVariableCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/liquidity-leveraged/:selectedDepositToken"
            component={LiquidityLeveraged}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/liquidity-leveraged"
            component={LiquidityLeveragedCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path="/vaults/:vaultAddress/:tradeType"
            component={VaultView}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path="/vaults/:vaultAddress"
            component={VaultView}
            routeType="Transaction"
          />
          <AppLayoutRoute
            path="/vaults"
            component={VaultCardView}
            routeType="Card"
          />
          <AppLayoutRoute
            path={`/portfolio/:category/:sideDrawerKey/:selectedToken`}
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path="/portfolio/:category/:sideDrawerKey"
            component={PortfolioFeatureShell}
            routeType="PortfolioTransaction"
          />
          <AppLayoutRoute
            path="/portfolio/:category/"
            component={PortfolioFeatureShell}
            routeType="Portfolio"
          />
          <AppLayoutRoute
            path="/portfolio"
            component={PortfolioFeatureShell}
            routeType="Portfolio"
          />
          <AppLayoutRoute
            path="/markets"
            component={Markets}
            routeType="Markets"
          />
          <AppLayoutRoute
            path="/error"
            component={ServerError}
            routeType="Error"
          />
          <AppLayoutRoute
            path="/contest"
            component={ContestHome}
            routeType="Landing"
          />
          <AppLayoutRoute
            path="/contest-rules"
            component={ContestRules}
            routeType="Landing"
          />
          <AppLayoutRoute
            path="/contest-leaderboard"
            component={ContestLeaderBoard}
            routeType="Landing"
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
          <LandingPageLayoutRoute
            path="/about"
            component={AboutUsView}
            routeType="Landing"
          />
          {/* <AppLayoutRoute path="/stake/:ethOrWeth" component={StakeView} />
          <AppLayoutRoute path="/stake" component={StakeView} />
          <AppLayoutRoute path="/unstake/:unstakePath" component={StakeView} />
          <AppLayoutRoute path="/unstake" component={StakeView} />
          <AppLayoutRoute path="/treasury" component={TreasuryView} /> */}
          <LandingPageLayoutRoute
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
    updateState,
    state: { themeVariant },
  } = globalState;
  const notionalTheme = useNotionalTheme(themeVariant);

  // Run as a useEffect here so that the observable "sees" the initial change
  useEffect(() => {
    updateState({
      selectedNetwork: getDefaultNetworkFromHostname(window.location.hostname),
    });
  }, [updateState]);

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <NotionalContext.Provider value={globalState}>
        <Web3OnboardProvider web3Onboard={OnboardContext}>
          <ScrollToTop />
          <AllRoutes />
        </Web3OnboardProvider>
      </NotionalContext.Provider>
    </ThemeProvider>
  );
};
