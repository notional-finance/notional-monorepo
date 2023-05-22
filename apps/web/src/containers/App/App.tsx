import {
  initializeNetwork,
  initialGlobalState,
  loadGlobalManager,
} from '@notional-finance/notionable';
import {
  NotionalContext,
  useNotional,
  useObservableContext,
} from '@notional-finance/notionable-hooks';
import { TrackingConsent } from '@notional-finance/shared-web';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { useCallback, useEffect, useState } from 'react';
import { Switch } from 'react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import { ServerError } from '../server-error/server-error';
import RouteContainer from './components/RouteContainer';
import AppLayoutRoute from './layouts/AppLayoutRoute';
import LandingPageLayoutRoute from './layouts/LandingPageLayoutRoute';
import { OnboardContext } from '@notional-finance/wallet';

// Feature shell views
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
import { getDefaultNetworkFromHostname } from '@notional-finance/util';
import { useConnect } from '@notional-finance/wallet/hooks/use-connect';

const AllRoutes = () => {
  const [routeKey, setRouteKey] = useState('');
  // Have this hook here to ensure that all children routes will see updates if the onboard
  // context changes (there is a useEffect hook inside here listening for changes in the
  // onboard context)
  useConnect();

  return (
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
          <AppLayoutRoute path="/lend/:currency" component={LendFeatureShell} />
          <AppLayoutRoute path="/lend" component={LendCardView} />
          <AppLayoutRoute
            path="/provide/:currency"
            routeKey={routeKey}
            component={LiquidityCurrencyView}
          />
          <AppLayoutRoute path="/provide" component={ProvideLiquidityCards} />
          <AppLayoutRoute path="/stake/:ethOrWeth" component={StakeView} />
          <AppLayoutRoute path="/stake" component={StakeView} />
          <AppLayoutRoute path="/unstake/:unstakePath" component={StakeView} />
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
          <AppLayoutRoute path="/portfolio" component={PortfolioFeatureShell} />
          <AppLayoutRoute path="/treasury" component={TreasuryView} />
          <AppLayoutRoute path="/error" component={ServerError} />
          <LandingPageLayoutRoute path="/about" component={AboutUsView} />
          <LandingPageLayoutRoute path="/" component={LandingPageView} />
        </Switch>
        <TrackingConsent />
      </RouteContainer>
    </CompatRouter>
  );
};

export const App = () => {
  const { pendingChainId, initializeNotional } = useNotional();
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
    initApplication();
  }, [initApplication]);

  // Re-initializes notional if the pending chain id changes
  useEffect(() => {
    if (pendingChainId !== -1) initializeNotional(pendingChainId);
  }, [pendingChainId, initializeNotional]);

  const globalState = useObservableContext(
    {
      ...initialGlobalState,
    },
    {},
    loadGlobalManager
  );

  // Run as a useEffect here so that the observable "sees" the initial change
  const { updateState } = globalState;
  useEffect(() => {
    updateState({
      selectedNetwork: getDefaultNetworkFromHostname(window.location.hostname),
    });
  }, [updateState]);

  return (
    <NotionalContext.Provider value={globalState}>
      <Web3OnboardProvider web3Onboard={OnboardContext}>
        <AllRoutes />
      </Web3OnboardProvider>
    </NotionalContext.Provider>
  );
};
