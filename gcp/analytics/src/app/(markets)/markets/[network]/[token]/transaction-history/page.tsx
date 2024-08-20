export const runtime = 'edge';

import DashboardLayout from 'layout/DashboardLayout';
import TransactionHistoryDefault from 'views/markets/transaction-history';

export default function DefaultMarketsPage({ params }: { params: { token: string; network: string } }) {
  return (
    <DashboardLayout>
      <TransactionHistoryDefault token={params.token} network={params.network} />
    </DashboardLayout>
  );
}
