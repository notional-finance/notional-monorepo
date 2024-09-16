// material-ui
import Grid from '@mui/material/Grid';

// project import
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import InvoiceCard from 'sections/apps/invoice/InvoiceCard';
import InvoiceUserList from 'sections/apps/invoice/InvoiceUserList';
import InvoiceNotificationList from 'sections/apps/invoice/InvoiceNotificationList';
import InvoicePieChart from 'sections/apps/invoice/InvoicePieChart';

import { APP_DEFAULT_PATH } from 'config';
import InvoiceChartCard from 'sections/apps/invoice/InvoiceChartCard';

// ==============================|| INVOICE - DASHBOARD ||============================== //

export default function Dashboard() {
  let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Invoice Summary' }];

  return (
    <>
      <Breadcrumbs custom heading="My Dashboard" links={breadcrumbLinks} />
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={9}>
          <InvoiceChartCard />
        </Grid>
        <Grid item xs={12} lg={3}>
          <InvoiceCard />
        </Grid>
        <Grid item sm={6} md={4} xs={12}>
          <InvoiceUserList />
        </Grid>
        <Grid item sm={6} md={4} xs={12}>
          <InvoicePieChart />
        </Grid>
        <Grid item sm={12} md={4} xs={12}>
          <InvoiceNotificationList />
        </Grid>
      </Grid>
    </>
  );
}
