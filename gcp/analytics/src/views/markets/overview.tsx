'use client';

// material-ui
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

// assets
import OverviewChart from 'views/notional-components/overview-chart';
import { Box } from '@mui/system';
import { TokenIcon } from '@notional-finance/icons';
import InvoiceChart from 'components/cards/invoice/InvoiceChart';
import { SharedH3, SharedSubtitle } from '../notional-components/shared-elements';
import { UtilizationChart } from '../notional-components/utilization-chart';

// utils
import { capitalizeFirstLetter } from 'utils/notional-utils';

interface InvoiceWidgets {
  title: string;
  count: string;
  percentage: number;
  isLoss: boolean;
  invoice: string;
  color: { main: string };
  chartData: number[];
}

const widgetData = [
  {
    title: 'Total Market Value',
    count: '$5678.09',
    percentage: 20.3,
    isLoss: true,
    invoice: '3',
    color: { main: 'red' }
  },
  {
    title: 'Total Deposits',
    count: '$5678.09',
    percentage: -8.73,
    isLoss: true,
    invoice: '5',
    color: { main: 'red' }
  }
];

const bottomWidgetsData: InvoiceWidgets[] = [
  {
    title: 'Paid',
    count: '$7,825',
    percentage: 70.5,
    isLoss: false,
    invoice: '9',
    color: { main: '#13BBC2' },
    chartData: [200, 600, 100, 400, 300, 400, 50]
  },
  {
    title: 'Unpaid',
    count: '$1,880',
    percentage: 27.4,
    isLoss: true,
    invoice: '6',
    color: { main: '#13BBC2' },
    chartData: [100, 550, 300, 350, 200, 100, 300]
  },
  {
    title: 'Overdue',
    count: '$3,507',
    percentage: 27.4,
    isLoss: true,
    invoice: '4',
    color: { main: '#13BBC2' },
    chartData: [100, 550, 200, 300, 100, 200, 300]
  }
];

export default function MarketsOverviewDefault({ token, network }: { token: string; network: string }) {
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
        <OverviewChart widgetData={widgetData} />
      </Grid>

      {/* row 2 */}
      <Grid item xs={12} sm={6} md={4} lg={4}>
        <Box sx={{ background: 'white', padding: '20px', borderRadius: '4px' }}>
          <SharedH3 sx={{ marginBottom: '4px' }}>$20.00 M</SharedH3>
          <SharedSubtitle>MAX CAPACITY</SharedSubtitle>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={4}>
        <Box sx={{ background: 'white', padding: '20px', borderRadius: '4px' }}>
          <SharedH3 sx={{ marginBottom: '4px' }}>6,300</SharedH3>
          <SharedSubtitle>ACTIVE USERS</SharedSubtitle>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={4}>
        <Box sx={{ background: 'white', padding: '20px', borderRadius: '4px' }}>
          <SharedH3 sx={{ marginBottom: '4px' }}>$3,450.1235</SharedH3>
          <SharedSubtitle>ORACLE PRICE</SharedSubtitle>
        </Box>
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: '27px' }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: '473px' }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 }, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <ListItemButton divider>
              <ListItemText primary="Company Finance Growth" />
              <Typography variant="h5">+45.14%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Company Expenses Ratio" />
              <Typography variant="h5">0.58%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
          </List>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: '27px' }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: '473px' }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 }, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <ListItemButton divider>
              <ListItemText primary="Company Finance Growth" />
              <Typography variant="h5">+45.14%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Company Expenses Ratio" />
              <Typography variant="h5">0.58%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
          </List>
        </MainCard>
      </Grid>
      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: '27px' }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: '473px' }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 }, display: 'flex', flexDirection: 'column', width: '100%' }}>
            <ListItemButton divider>
              <ListItemText primary="Company Finance Growth" />
              <Typography variant="h5">+45.14%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Company Expenses Ratio" />
              <Typography variant="h5">0.58%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
          </List>
        </MainCard>
      </Grid>

      {/* row 3 */}
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

      {/* row 4 */}
      {bottomWidgetsData.map((widget: InvoiceWidgets, index: number) => (
        <Grid item xs={12} sm={4} md={4} lg={4} key={index}>
          <MainCard>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ width: '30%' }}>
                <SharedSubtitle>Total Supplied</SharedSubtitle>
                <SharedH3>$19.2</SharedH3>
              </Box>
              <InvoiceChart color={widget.color} data={widget.chartData} />
            </Box>
          </MainCard>
        </Grid>
      ))}
    </Grid>
  );
}
