'use client';
// material-ui
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { UtilizationChart } from '../notional-components/utilization-chart';

// project import
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { TokenIcon } from '@notional-finance/icons';
import { Box, useTheme } from '@mui/material';

export default function ParametersDefault({ token, network }: { token: string; network: string }) {
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

      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: theme.spacing(3) }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: theme.spacing(59) }} content={false}>
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

      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: theme.spacing(3) }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: theme.spacing(59) }} content={false}>
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

      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: theme.spacing(3) }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: theme.spacing(59) }} content={false}>
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

      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>

      <Grid item xs={12} md={7} lg={8}>
        <UtilizationChart />
      </Grid>
      <Grid item xs={12} md={5} lg={4} sx={{ marginTop: theme.spacing(3) }}>
        <MainCard sx={{ mt: 2, display: 'flex', height: theme.spacing(59) }} content={false}>
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

      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>

      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
      </Grid>
      <Grid item xs={12} sm={6} md={2} lg={2}>
        <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Vault Parameters</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid>
    </Grid>
  );
}
