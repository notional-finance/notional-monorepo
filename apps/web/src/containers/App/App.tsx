import {
  NotionalContext,
  useGlobalContext,
} from '@notional-finance/notionable-hooks';
import { TrackingConsent } from '@notional-finance/shared-web';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { useEffect, useState } from 'react';
import { Switch } from 'react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { useHistory, useLocation } from 'react-router-dom';
import { ServerError } from '../ServerError/server-error';
import RouteContainer from './components/RouteContainer';
import AppLayoutRoute from './layouts/AppLayoutRoute';
import LandingPageLayoutRoute from './layouts/LandingPageLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ScrollToTop } from '@notional-finance/mui';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';
import {
  useConnect,
  BETA_ACCESS,
  useNftContract,
} from '@notional-finance/wallet/hooks';
import { useNotionalTheme } from '@notional-finance/styles';
// Feature shell views
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/helpers';
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
  VaultActionProvider,
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
  const [routeKey, setRouteKey] = useState('');
  const history = useHistory();
  const { pathname } = useLocation();
  const userSettings = getFromLocalStorage('userSettings');
  const onboardWallet = getFromLocalStorage('onboard.js:last_connected_wallet');
  // Have this hook here to ensure that all children routes will see updates if the onboard
  // context changes (there is a useEffect hook inside here listening for changes in the
  // onboard context)
  useConnect();
  useNftContract();

  useEffect(() => {
    console.log({ onboardWallet });
    if (!onboardWallet || onboardWallet.length === 0) {
      setInLocalStorage('userSettings', {
        ...userSettings,
        betaAccess: undefined,
      });
    }
  }, [onboardWallet, userSettings]);

  useEffect(() => {
    if (
      userSettings.betaAccess === BETA_ACCESS.REJECTED ||
      userSettings.betaAccess === undefined
    ) {
      if (pathname.includes('contest')) {
        history.push(pathname);
      } else {
        history.push('/contest');
      }
    }
  }, [history, userSettings.betaAccess, pathname]);

  return (
    <CompatRouter>
      <RouteContainer onRouteChange={setRouteKey}>
        <Switch>
          <AppLayoutRoute
            path="/borrow-fixed/:selectedDepositToken"
            routeKey={routeKey}
            component={BorrowFixed}
          />
          <AppLayoutRoute
            path="/borrow-fixed"
            component={BorrowFixedCardView}
          />
          <AppLayoutRoute
            path="/borrow-variable/:selectedDepositToken"
            routeKey={routeKey}
            component={BorrowVariable}
          />
          <AppLayoutRoute
            path="/borrow-variable"
            component={BorrowVariableCardView}
          />
          <AppLayoutRoute
            path="/lend-fixed/:selectedDepositToken"
            component={LendFixed}
          />
          <AppLayoutRoute
            path="/lend-leveraged/:selectedDepositToken"
            component={LendLeveraged}
          />
          <AppLayoutRoute path="/lend-fixed" component={LendCardView} />
          <AppLayoutRoute
            path="/lend-variable/:selectedDepositToken"
            component={LendVariable}
          />
          <AppLayoutRoute
            path="/lend-variable"
            component={LendVariableCardView}
          />
          <AppLayoutRoute
            path="/lend-leveraged"
            component={LendLeveragedCardView}
          />

          <AppLayoutRoute
            path="/liquidity-variable/:selectedDepositToken"
            routeKey={routeKey}
            component={LiquidityVariable}
          />
          <AppLayoutRoute
            path="/liquidity-variable"
            component={LiquidityVariableCardView}
          />

          <AppLayoutRoute
            path="/liquidity-leveraged/:selectedDepositToken"
            routeKey={routeKey}
            component={LiquidityLeveraged}
          />
          <AppLayoutRoute
            path="/liquidity-leveraged"
            component={LiquidityLeveragedCardView}
          />
          <AppLayoutRoute
            path="/vaults/:vaultAddress/:tradeType"
            component={VaultActionProvider}
          />
          <AppLayoutRoute
            path="/vaults/:vaultAddress"
            component={VaultActionProvider}
          />
          <AppLayoutRoute path="/vaults" component={VaultCardView} />
          <AppLayoutRoute path="/terms" component={TermsView} />
          <AppLayoutRoute path="/privacy" component={PrivacyView} />
          <AppLayoutRoute
            path={`/portfolio/:category/:sideDrawerKey/:selectedToken`}
            component={PortfolioFeatureShell}
          />
          <AppLayoutRoute
            path="/portfolio/:category/:sideDrawerKey"
            component={PortfolioFeatureShell}
          />
          <AppLayoutRoute
            path="/portfolio/:category/"
            component={PortfolioFeatureShell}
          />
          <AppLayoutRoute path="/portfolio" component={PortfolioFeatureShell} />
          <AppLayoutRoute path="/markets" component={Markets} />
          <AppLayoutRoute path="/error" component={ServerError} />
          <AppLayoutRoute path="/contest" component={ContestHome} />
          <AppLayoutRoute path="/contest-rules" component={ContestRules} />
          <AppLayoutRoute
            path="/contest-leaderboard"
            component={ContestLeaderBoard}
          />
          <LandingPageLayoutRoute path="/about" component={AboutUsView} />
          {/* <AppLayoutRoute path="/stake/:ethOrWeth" component={StakeView} />
          <AppLayoutRoute path="/stake" component={StakeView} />
          <AppLayoutRoute path="/unstake/:unstakePath" component={StakeView} />
          <AppLayoutRoute path="/unstake" component={StakeView} />
          <AppLayoutRoute path="/treasury" component={TreasuryView} /> */}
          <LandingPageLayoutRoute path="/" component={LandingPageView} />
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
