import DashboardLayout from 'layout/DashboardLayout';
import AllAccounts from 'views/accounts/all-accounts/all-accounts';

export default function DefaultMarketsPage() {
  return (
    <DashboardLayout>
      <AllAccounts />
    </DashboardLayout>
  );
}
