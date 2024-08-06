// material-ui
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

export default function BreakdownsDefault({ token }: { token: string }) {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} md={12} lg={12} sx={{ marginTop: '80px' }}>
        <h1>{token} / Breakdowns</h1>
      </Grid>
      {/* row 1 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: '24px' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: '10px' }}>
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
        <Box sx={{ background: 'white', padding: '24px' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: '10px' }}>
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
        <Box sx={{ background: 'white', padding: '24px' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item sx={{ marginBottom: '10px' }}>
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
