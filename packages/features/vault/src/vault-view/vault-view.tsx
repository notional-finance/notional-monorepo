import { useEffect } from 'react';
import { PageLoading, SideBarLayout } from '@notional-finance/mui';
import { useContext } from 'react';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { useVaultTransaction } from '../hooks/use-vault-transaction';
import { VaultActionContext } from './vault-action-provider';
import { VaultActionSideDrawer } from './vault-action-side-drawer';
import { useNotional } from '@notional-finance/notionable-hooks';
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
  const { loaded } = useNotional();
  const showTransactionConfirmation = txnData ? true : false;

  useEffect(() => {
    if (vaultAddress) updateState({ vaultAddress });
  }, [vaultAddress, updateState]);

  console.log({ _state });
  console.log({ state });

  return (
    <div>
      {state?.returnDrivers && loaded ? (
        <SideBarLayout
          showTransactionConfirmation={showTransactionConfirmation}
          sideBar={<VaultActionSideDrawer />}
          mainContent={<VaultSummary />}
        />
      ) : (
        <PageLoading />
      )}
    </div>
  );
};

export default VaultView;
