import DashboardLayout from 'layout/DashboardLayout';
import MarketsOverviewDefault from 'views/markets/overview';

export default function DefaultMarketsPage({ params }: { params: { token: string } }) {
  return (
    <DashboardLayout>
      <MarketsOverviewDefault token={params.token} />
    </DashboardLayout>
  );
}
