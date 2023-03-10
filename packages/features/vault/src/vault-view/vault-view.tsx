import { useEffect } from 'react';
import { PageLoading, SideBarLayout } from '@notional-finance/mui';
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
  const { updateState } = useContext(VaultActionContext);
  const { vaultAddress, sideDrawerKey } = useParams<VaultParams>();
  const txnData = useVaultTransaction();
  const showTransactionConfirmation = txnData ? true : false;

  useEffect(() => {
    if (vaultAddress) {
      updateState({
        vaultAddress,
      });
    }
  }, [vaultAddress, updateState, sideDrawerKey]);

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
