import { VaultSideDrawer } from '../components/vault-side-drawer';
import { useWithdrawVaultPostMaturity } from './use-withdraw-vault-post-maturity';

export const WithdrawVaultPostMaturity = () => {
  const transactionData = useWithdrawVaultPostMaturity();

  return <VaultSideDrawer transactionData={transactionData}></VaultSideDrawer>;
};
