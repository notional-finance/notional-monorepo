export const runtime = 'edge';

import DashboardLayout from 'layout/DashboardLayout';
import ParametersDefault from 'views/markets/parameters';

export default function DefaultMarketsPage({ params }: { params: { token: string; network: string } }) {
  return (
    <DashboardLayout>
      <ParametersDefault token={params.token} network={params.network} />
    </DashboardLayout>
  );
}
