export const runtime = 'edge';

import DashboardLayout from 'layout/DashboardLayout';
import HistoricalMarketDataDefault from 'views/markets/historical-market-data';

export default function DefaultMarketsPage({ params }: { params: { token: string; network: string } }) {
  return (
    <DashboardLayout>
      <HistoricalMarketDataDefault token={params.token} network={params.network} />
    </DashboardLayout>
  );
}
