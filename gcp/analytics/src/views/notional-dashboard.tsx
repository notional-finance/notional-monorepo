'use client';
import { useState } from 'react';
// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// notional components
import OverviewChart from './notional-components/overview-chart';

// project import
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { Box } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

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
  },
  {
    title: 'Total Open Debt',
    count: '$5678.09',
    percentage: 1.73,
    isLoss: false,
    invoice: '20',
    color: { main: '#13BBC2' }
  }
];

export default function NotionalDashboard() {
  const theme = useTheme();
  const [slot, setSlot] = useState('week');

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment) setSlot(newAlignment);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} md={12} lg={12}>
        <Typography variant="h2" sx={{ marginTop: theme.spacing(9), marginBottom: '0px' }}>
          Notional System Overview
        </Typography>
      </Grid>

      {/* row 2 */}
      <Grid item xs={12} md={12} lg={12}>
        <OverviewChart widgetData={widgetData} />
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: theme.spacing(2) }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">Market Summary</Typography>
            </Grid>
            <ToggleButtonGroup exclusive size="small" value={slot} onChange={handleChange}>
              <ToggleButton disabled={slot === 'week'} value="week" sx={{ px: 2, py: 0.5 }}>
                Mainnet
              </ToggleButton>
              <ToggleButton disabled={slot === 'month'} value="month" sx={{ px: 2, py: 0.5 }}>
                Arbitrum
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <MainCard sx={{ mt: 2 }} content={false}>
            <OrdersTable />
          </MainCard>
        </Box>
      </Grid>

      {/* row 4 */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">View Our Other Dashboards</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ background: theme.palette.primary.main, padding: theme.spacing(2.5), borderRadius: theme.spacing(0.5) }}>
          <Typography variant="h4" color="white" sx={{ marginBottom: theme.spacing(0.5) }}>
            Dune Dashboard Mainnet
          </Typography>
          <Typography variant="h6" color="white">
            {`Follow Notional's stats on Dune.`}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ background: theme.palette.primary.main, padding: theme.spacing(2.5), borderRadius: theme.spacing(0.5) }}>
          <Typography variant="h4" color="white" sx={{ marginBottom: theme.spacing(0.5) }}>
            Dune Dashboard Arbitrum
          </Typography>
          <Typography variant="h6" color="white">
            {`Follow Notional's stats on Dune.`}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ background: theme.palette.primary.main, padding: theme.spacing(2.5), borderRadius: theme.spacing(0.5) }}>
          <Typography variant="h4" color="white" sx={{ marginBottom: theme.spacing(0.5) }}>
            Defi Llama
          </Typography>
          <Typography variant="h6" color="white">
            See our overview and current yields.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Box sx={{ background: theme.palette.primary.main, padding: theme.spacing(2.5), borderRadius: theme.spacing(0.5) }}>
          <Typography variant="h4" color="white" sx={{ marginBottom: theme.spacing(0.5) }}>
            Subgraphs
          </Typography>
          <Typography variant="h6" color="white">
            Get access to decentralized analytics.
          </Typography>
        </Box>
      </Grid>

      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />
    </Grid>
  );
}
