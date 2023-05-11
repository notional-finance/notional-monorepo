import { useEffect } from 'react';
import { SideBarLayout, FeatureLoader } from '@notional-finance/mui';
import { useContext } from 'react';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVaultTransaction } from '../hooks/use-vault-transaction';
import { VaultActionContext } from './vault-action-provider';
import { VaultActionSideDrawer } from './vault-action-side-drawer';
import { VaultSummary } from './vault-summary';
import { useParams } from 'react-router';

export interface VaultParams {
  vaultAddress?: string;
  sideDrawerKey?: VAULT_ACTIONS;
}

export const VaultView = () => {
  const { updateState, _state, state } = useContext(VaultActionContext);
  const { vaultAddress } = useParams<VaultParams>();
  const txnData = useVaultTransaction();
  const showTransactionConfirmation = txnData ? true : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (vaultAddress) updateState({ vaultAddress });
  }, [vaultAddress, updateState]);

  const featureLoaded = state?.returnDrivers ? true : false;

  return (
    <div>
      <FeatureLoader featureLoaded={featureLoaded}>
        <SideBarLayout
          showTransactionConfirmation={showTransactionConfirmation}
          sideBar={<VaultActionSideDrawer />}
          mainContent={<VaultSummary />}
        />
      </FeatureLoader>
    </div>
  );
};

export default VaultView;
