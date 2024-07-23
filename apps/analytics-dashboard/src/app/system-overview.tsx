'use client';
import { useState } from 'react';
// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// notional components
import OverviewChart from './dashboard-components/overview-chart';

// project import
import MainCard from './dashboard-components/main-card';
import AnalyticEcommerce from './dashboard-components/analytic-ecommerce';
import OrdersTable from './dashboard-components/orders-table';
import { Box } from '@mui/material';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function SystemOverview() {
  const [slot, setSlot] = useState('week');

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment) setSlot(newAlignment);
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid item xs={12} md={12} lg={12}>
        <h1>Notional System Overview</h1>
      </Grid>

      {/* row 2 */}
      <Grid item xs={12} md={12} lg={12}>
        <OverviewChart />
      </Grid>

      {/* row 3 */}
      <Grid item xs={12} md={12} lg={12}>
        <Box sx={{ background: 'white', padding: '16px' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h5">Market Summary</Typography>
            </Grid>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={slot}
              onChange={handleChange}
            >
              <ToggleButton
                disabled={slot === 'week'}
                value="week"
                sx={{ px: 2, py: 0.5 }}
              >
                Week
              </ToggleButton>
              <ToggleButton
                disabled={slot === 'month'}
                value="month"
                sx={{ px: 2, py: 0.5 }}
              >
                Month
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
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Page Views"
          count="4,42,236"
          percentage={59.3}
          extra="35,000"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Users"
          count="78,250"
          percentage={70.5}
          extra="8,900"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Order"
          count="18,800"
          percentage={27.4}
          isLoss
          color="warning"
          extra="1,943"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Sales"
          count="$35,078"
          percentage={27.4}
          isLoss
          color="warning"
          extra="$20,395"
        />
      </Grid>

      <Grid
        item
        md={8}
        sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }}
      />
    </Grid>
  );
}
