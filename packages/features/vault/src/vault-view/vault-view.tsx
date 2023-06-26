import { useEffect } from 'react';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { useContext } from 'react';
import { VaultActionContext } from './vault-action-provider';
import { VaultActionSideDrawer } from './vault-action-side-drawer';
import { VaultSummary } from './vault-summary';

export const VaultView = () => {
  const {
    state: { isReady, confirm },
  } = useContext(VaultActionContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <FeatureLoader featureLoaded={isReady}>
      <SideBarLayout
        showTransactionConfirmation={confirm}
        sideBar={<VaultActionSideDrawer />}
        mainContent={<VaultSummary />}
      />
    </FeatureLoader>
  );
};

export default VaultView;
