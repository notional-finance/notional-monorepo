'use client';
// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// utils
import { capitalizeFirstLetter } from 'utils/notional-utils';

// project import
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { TokenIcon } from '@notional-finance/icons';

export default function TransactionHistoryDefault({ token, network }: { token: string; network: string }) {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} md={12} lg={12} sx={{ marginTop: '80px', display: 'flex', alignItems: 'center' }}>
        <TokenIcon symbol={token.toLocaleLowerCase()} size={'large'} style={{ marginRight: '16px' }} />
        <h1>
          {token} / {capitalizeFirstLetter(network)} Market
        </h1>
      </Grid>
      {/* row 1 */}
      <Grid item xs={12} md={12} lg={12}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>
      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  );
}
