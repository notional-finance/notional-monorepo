import DashboardLayout from 'layout/DashboardLayout';
import TransactionsDefault from 'views/transactions/transactions';

export default function DefaultMarketsPage() {
  return (
    <DashboardLayout>
      <TransactionsDefault />
    </DashboardLayout>
  );
}
