'use client';
// material-ui
import { Box, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { TokenIcon } from '@notional-finance/icons';

export default function BreakdownsDefault({ token, network }: { token: string; network: string }) {
  const theme = useTheme();
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} md={12} lg={12} sx={{ marginTop: theme.spacing(10), display: 'flex', alignItems: 'center' }}>
        <TokenIcon symbol={token.toLocaleLowerCase()} size={'large'} style={{ marginRight: theme.spacing(2) }} />
        <h1 style={{ display: 'flex' }}>
          {token} /{' '}
          <Box sx={{ textTransform: 'capitalize', marginLeft: theme.spacing(0.75), marginRight: theme.spacing(0.75) }}>{network}</Box>{' '}
          Market
        </h1>
      </Grid>
      {/* row 1 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: theme.spacing(3) }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: theme.spacing(1) }}>
              <Typography variant="h5">Deposit Breakdown</Typography>
            </Grid>
            <Grid item />
          </Grid>
          <MainCard sx={{ mt: 2 }} content={false}>
            <OrdersTable />
          </MainCard>
        </Box>
      </Grid>

      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

      {/* row 2 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: theme.spacing(3) }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: theme.spacing(1) }}>
              <Typography variant="h5">Debt Breakdown</Typography>
            </Grid>
            <Grid item />
          </Grid>
          <MainCard sx={{ mt: 2 }} content={false}>
            <OrdersTable />
          </MainCard>
        </Box>
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: theme.spacing(3) }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: theme.spacing(1) }}>
              <Typography variant="h5">Debt by Source</Typography>
            </Grid>
            <Grid item />
          </Grid>
          <MainCard sx={{ mt: 2 }} content={false}>
            <OrdersTable />
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}
