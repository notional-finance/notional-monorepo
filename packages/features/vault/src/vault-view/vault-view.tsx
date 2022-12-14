import { PageLoading, SideBarLayout } from '@notional-finance/mui';
import { useQueryParams } from '@notional-finance/utils';
import { useContext } from 'react';
import { ConfirmVaultTxn } from '../components/confirm-vault-txn';
import { useVaultTransaction } from '../hooks/use-vault-transaction';
import { VaultActionContext } from '../managers';
import { VaultAction } from './vault-action';
import { VaultSummary } from './vault-summary';

export const VaultView = () => {
  const { state } = useContext(VaultActionContext);
  const txnData = useVaultTransaction();
  const showTransactionConfirmation = txnData ? true : false;
  const { vaultAddress } = state || {};
  const { confirm } = useQueryParams();
  const confirmRoute = !!confirm;

  return vaultAddress ? (
    <SideBarLayout
      showTransactionConfirmation={showTransactionConfirmation}
      sideBar={confirmRoute ? <ConfirmVaultTxn /> : <VaultAction />}
      mainContent={<VaultSummary />}
    />
  ) : (
    <PageLoading />
  );
};

export default VaultView;
