import { useEffect } from 'react';
import { SideBarLayout } from '@notional-finance/mui';
import { VaultActionSideDrawer } from './vault-view/vault-action-side-drawer';
import { VaultSummary } from './vault-view/vault-summary';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  createVaultContext,
  useVaultContext,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';

export const VaultActionContext = createVaultContext();

export const VaultView = () => {
  const context = useVaultContext();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    state: { isReady, confirm, selectedNetwork },
  } = context;
  const { allYields } = useAllMarkets(selectedNetwork);
  const featureReady = isReady && allYields.length > 0;

  return (
    <VaultActionContext.Provider value={context}>
      <FeatureLoader featureLoaded={featureReady}>
        <SideBarLayout
          showTransactionConfirmation={confirm}
          sideBar={<VaultActionSideDrawer />}
          mainContent={<VaultSummary />}
        />
      </FeatureLoader>
    </VaultActionContext.Provider>
  );
};

export default VaultView;
