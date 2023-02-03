import { PageLoading, SideBarLayout } from '@notional-finance/mui';
import { useContext } from 'react';
import { VAULT_SUB_NAV_ACTIONS } from '@notional-finance/shared-config';
import { useVaultTransaction } from '../hooks/use-vault-transaction';
import { VaultActionContext } from '../managers';
// import { VaultAction } from './vault-action';
import { VaultActionSideDrawer } from './vault-action-side-drawer';
import { VaultSummary } from './vault-summary';

export const VaultView = () => {
  const { state } = useContext(VaultActionContext);
  const txnData = useVaultTransaction();
  const showTransactionConfirmation = txnData ? true : false;
  const { vaultAddress } = state || {};

  return vaultAddress ? (
    <SideBarLayout
      showTransactionConfirmation={showTransactionConfirmation}
      sideBar={<VaultActionSideDrawer />}
      mainContent={<VaultSummary />}
    />
  ) : (
    <PageLoading />
  );
};

export default VaultView;
