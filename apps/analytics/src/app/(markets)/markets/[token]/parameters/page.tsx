export const runtime = 'edge';

import DashboardLayout from 'layout/DashboardLayout';
import ParametersDefault from 'views/markets/parameters';

export default function DefaultMarketsPage({ params }: { params: { token: string } }) {
  return (
    <DashboardLayout>
      <ParametersDefault token={params.token} />
    </DashboardLayout>
  );
}
