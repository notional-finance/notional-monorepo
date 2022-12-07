import { useCallback, useEffect, useState } from 'react';
import { datadogRum } from '@datadog/browser-rum';
import { useImpactTracking } from '@notional-finance/utils';
import { initPlausible } from '@notional-finance/helpers';
import { getFromLocalStorage } from '@notional-finance/helpers';
import Plausible from 'plausible-tracker';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Switch } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import RouteContainer from './components/RouteContainer';
import AppLayoutRoute from './layouts/AppLayoutRoute';
import LandingPageLayoutRoute from './layouts/LandingPageLayoutRoute';
import {
  TrackingConsent,
  useUserSettingsState,
} from '@notional-finance/shared-web';
import { useNotional } from '@notional-finance/notionable-hooks';
import { initializeNetwork } from '@notional-finance/notionable';
import { ServerError } from '../../containers/server-error/server-error';
import { PageLoading } from '@notional-finance/mui';
import { useNotionalTheme } from '@notional-finance/styles';
// Lazy Loaded Views
import AboutUsView from '@notional-finance/about-us-feature-shell/Loadable';
import StakeView from '@notional-finance/stake-feature-shell/Loadable';
import LendCardView from '@notional-finance/lend-feature-shell/lend-card-view';
import LendCurrencyView from '@notional-finance/lend-feature-shell/Loadable';
import PortfolioView from '@notional-finance/portfolio-feature-shell/Loadable';
import BorrowCardView from '@notional-finance/borrow-feature-shell/borrow-card-view';
import BorrowCurrencyView from '@notional-finance/borrow-feature-shell/Loadable';
import LiquidityCurrencyView from '@notional-finance/liquidity-feature-shell/Loadable';
import TreasuryView from '@notional-finance/treasury-feature-shell/Loadable';
import {
  VaultLoadable,
  AllVaultsLoadable,
} from '@notional-finance/vault-feature-shell';
import AirdropView from '../../containers/AirdropView/Loadable';
import TermsView from '../../containers/TermsView/Loadable';
import PrivacyView from '../../containers/PrivacyView/Loadable';
import LandingPageView from '../../containers/LandingPageView/Loadable';
import { ProvideLiquidityCards } from '@notional-finance/liquidity-feature-shell';
import { createLogger } from '@notional-finance/logging';
const applicationId = process.env['NX_DD_APP_ID'] as string;
const clientToken = process.env['NX_DD_API_KEY'] as string;
const site = process.env['NX_DD_BASE_URL'];
// COMMIT_REF environment variable is supplied by netlify on deployment
const version = `${process.env['COMMIT_REF']?.substring(0, 8) || 'local'}`;
const DD_API_KEY = process.env['NX_DD_API_KEY'] as string;
const service = 'web-frontend';
const NX_ENV = process.env['NX_ENV'] as string;
const { disableErrorReporting } = getFromLocalStorage('privacySettings');

datadogRum.init({
  beforeSend: () => {
    if (disableErrorReporting) {
      return false;
    }
  },
  applicationId,
  clientToken,
  site,
  service,
  env: window.location.hostname,
  version,
  sampleRate: 100,
  trackInteractions: false,
});

export const App = () => {
  const { trackPageview } = Plausible();
  const [routeKey, setRouteKey] = useState('');
  const { themeVariant } = useUserSettingsState();
  const notionalTheme = useNotionalTheme(themeVariant);
  const { loaded, pendingChainId, initializeNotional } = useNotional();
  useImpactTracking();

  const initApplication = useCallback(async () => {
    try {
      createLogger({
        apiKey: DD_API_KEY,
        service,
        env: NX_ENV,
        version,
      });
      await initializeNetwork({ container: '#onboard' });
    } catch (error) {
      reportError({
        name: 'Unable to Init Onboard',
        message: 'Unable to Init Onboard',
        msgId: 'notional.error.unableToInitOnboard',
        code: 500,
      });
    }
  }, []);

  useEffect(() => {
    initPlausible();
    trackPageview();
  }, [trackPageview]);

  useEffect(() => {
    initApplication();
  }, [initApplication]);

  // Re-initializes notional if the pending chain id changes
  useEffect(() => {
    if (pendingChainId !== -1) initializeNotional(pendingChainId);
  }, [pendingChainId, initializeNotional]);

  return (
    <ThemeProvider theme={notionalTheme}>
      <CssBaseline />
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter5Adapter}>
          <CompatRouter>
            {loaded ? (
              <RouteContainer onRouteChange={setRouteKey}>
                <Switch>
                  <AppLayoutRoute path="/airdrop" component={AirdropView} />
                  <AppLayoutRoute
                    path="/borrow/:currency/:collateral"
                    routeKey={routeKey}
                    component={BorrowCurrencyView}
                  />
                  <AppLayoutRoute path="/borrow" component={BorrowCardView} />
                  <AppLayoutRoute
                    path="/lend/:currency"
                    component={LendCurrencyView}
                  />
                  <AppLayoutRoute path="/lend" component={LendCardView} />
                  <AppLayoutRoute
                    path="/provide/:currency"
                    routeKey={routeKey}
                    component={LiquidityCurrencyView}
                  />
                  <AppLayoutRoute
                    path="/provide"
                    component={ProvideLiquidityCards}
                  />
                  <AppLayoutRoute
                    path="/stake/:ethOrWeth"
                    component={StakeView}
                  />
                  <AppLayoutRoute path="/stake" component={StakeView} />
                  <AppLayoutRoute
                    path="/unstake/:unstakePath"
                    component={StakeView}
                  />
                  <AppLayoutRoute path="/unstake" component={StakeView} />
                  <AppLayoutRoute
                    path="/vaults/:vaultAddress"
                    component={VaultLoadable}
                  />
                  <AppLayoutRoute
                    path="/vaults"
                    component={AllVaultsLoadable}
                  />
                  <AppLayoutRoute path="/terms" component={TermsView} />
                  <AppLayoutRoute path="/privacy" component={PrivacyView} />
                  <AppLayoutRoute
                    path="/portfolio/:category/:sideDrawerKey"
                    component={PortfolioView}
                  />
                  <AppLayoutRoute
                    path="/portfolio/:category/"
                    component={PortfolioView}
                  />
                  <AppLayoutRoute path="/portfolio" component={PortfolioView} />
                  <AppLayoutRoute path="/treasury" component={TreasuryView} />
                  <AppLayoutRoute path="/error" component={ServerError} />
                  <LandingPageLayoutRoute
                    path="/about"
                    component={AboutUsView}
                  />
                  <LandingPageLayoutRoute
                    path="/"
                    component={LandingPageView}
                  />
                </Switch>
                <TrackingConsent />
              </RouteContainer>
            ) : (
              <PageLoading />
            )}
          </CompatRouter>
        </QueryParamProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};
export default App;
