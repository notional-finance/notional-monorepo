export const runtime = 'edge';

import DashboardLayout from 'layout/DashboardLayout';
import BreakdownsDefault from 'views/markets/breakdowns';

export default function DefaultMarketsPage({ params }: { params: { token: string } }) {
  return (
    <DashboardLayout>
      <BreakdownsDefault token={params.token} />
    </DashboardLayout>
  );
}
