import { Web3OnboardProvider } from '@web3-onboard/react';
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
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { useNotional } from '@notional-finance/notionable-hooks';
import { initializeNetwork } from '@notional-finance/notionable';
import { TrackingConsent } from '@notional-finance/shared-web';
import { ServerError } from '../../containers/server-error/server-error';
import { useNotionalTheme } from '@notional-finance/styles';
import { AboutUsView } from '@notional-finance/about-us-feature-shell';
import { StakeView } from '@notional-finance/stake-feature-shell';
import LendCardView from '@notional-finance/lend-feature-shell/lend-card-view';
import { LendFeatureShell } from '@notional-finance/lend-feature-shell';
import { PortfolioFeatureShell } from '@notional-finance/portfolio-feature-shell';
import BorrowCardView from '@notional-finance/borrow-feature-shell/borrow-card-view';
import { BorrowFeatureShell } from '@notional-finance/borrow-feature-shell';
import { LiquidityCurrencyView } from '@notional-finance/liquidity-feature-shell';
import { TreasuryView } from '@notional-finance/treasury-feature-shell';
import {
  VaultActionProvider,
  AllStrategyView,
} from '@notional-finance/vault-feature-shell';
import { AirdropView } from '../../containers/AirdropView';
import { TermsView } from '../../containers/TermsView';
import { PrivacyView } from '../../containers/PrivacyView';
import { LandingPageView } from '../../containers/LandingPageView';
import { ProvideLiquidityCards } from '@notional-finance/liquidity-feature-shell';
import { OnboardContext } from '@notional-finance/wallet';
const applicationId = process.env['NX_DD_APP_ID'] as string;
const clientToken = process.env['NX_DD_API_KEY'] as string;
const DD_SITE = process.env['NX_DD_SITE'];
// COMMIT_REF environment variable is supplied by netlify on deployment
const version = `${process.env['NX_COMMIT_REF']?.substring(0, 8) || 'local'}`;
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
  site: DD_SITE,
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
  const { pendingChainId, initializeNotional } = useNotional();
  useImpactTracking();

  const initApplication = useCallback(async () => {
    try {
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
      <Web3OnboardProvider web3Onboard={OnboardContext}>
        <CssBaseline />
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter5Adapter}>
            <CompatRouter>
              <RouteContainer onRouteChange={setRouteKey}>
                <Switch>
                  <AppLayoutRoute path="/airdrop" component={AirdropView} />
                  <AppLayoutRoute
                    path="/borrow/:currency/:collateral"
                    routeKey={routeKey}
                    component={BorrowFeatureShell}
                  />
                  <AppLayoutRoute path="/borrow" component={BorrowCardView} />
                  <AppLayoutRoute
                    path="/lend/:currency"
                    component={LendFeatureShell}
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
                    path="/vaults/:vaultAddress/:sideDrawerKey"
                    component={VaultActionProvider}
                  />
                  <AppLayoutRoute
                    path="/vaults/:vaultAddress"
                    component={VaultActionProvider}
                  />
                  <AppLayoutRoute path="/vaults" component={AllStrategyView} />
                  <AppLayoutRoute path="/terms" component={TermsView} />
                  <AppLayoutRoute path="/privacy" component={PrivacyView} />
                  <AppLayoutRoute
                    path="/portfolio/:category/:sideDrawerKey"
                    component={PortfolioFeatureShell}
                  />
                  <AppLayoutRoute
                    path="/portfolio/:category/"
                    component={PortfolioFeatureShell}
                  />
                  <AppLayoutRoute
                    path="/portfolio"
                    component={PortfolioFeatureShell}
                  />
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
            </CompatRouter>
          </QueryParamProvider>
        </BrowserRouter>
      </Web3OnboardProvider>
    </ThemeProvider>
  );
};
export default App;
