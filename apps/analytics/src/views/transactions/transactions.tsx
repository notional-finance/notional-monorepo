import Grid from '@mui/material/Grid';
// project import
import MainCard from 'components/MainCard';
import Typography from '@mui/material/Typography';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

export default function TransactionsDefault() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="h2" sx={{ marginTop: '72px', marginBottom: '0px' }}>
          Transactions
        </Typography>
      </Grid>
      <Grid item xs={12} md={12} lg={12}>
        <MainCard content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>{' '}
    </Grid>
  );
}
