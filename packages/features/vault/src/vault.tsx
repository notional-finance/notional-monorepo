import { useEffect } from 'react';
import { SideBarLayout } from '@notional-finance/mui';
import { VaultActionSideDrawer } from './vault-view/vault-action-side-drawer';
import { VaultSummary } from './vault-view/vault-summary';
import { FeatureLoader } from '@notional-finance/shared-web';
import {
  createVaultContext,
  useVaultContext,
} from '@notional-finance/notionable-hooks';

export const VaultActionContext = createVaultContext();

export const VaultView = () => {
  const context = useVaultContext();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    state: { isReady, confirm },
  } = context;

  return (
    <VaultActionContext.Provider value={context}>
      <FeatureLoader featureLoaded={isReady}>
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
