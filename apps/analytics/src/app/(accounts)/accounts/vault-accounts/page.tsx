import DashboardLayout from 'layout/DashboardLayout';
import VaultAccounts from 'views/accounts/vault-accounts/vault-accounts';

export default function DefaultMarketsPage() {
  return (
    <DashboardLayout>
      <VaultAccounts />
    </DashboardLayout>
  );
}
