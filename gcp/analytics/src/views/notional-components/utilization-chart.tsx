import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SharedH4, ChartSubtitle } from './shared-elements';
import Dot from 'components/@extended/Dot';

// project import
import MainCard from 'components/MainCard';
import IncomeAreaChart from '../../sections/dashboard/default/IncomeAreaChart';

interface UtilizationChartProps {
  title?: string;
  utilizationValue?: string;
  legendOne?: string;
  legendTwo?: string;
}

export const UtilizationChart = ({
  title = 'Lending',
  utilizationValue = '84.7%',
  legendOne = 'Lend Fixed',
  legendTwo = 'Borrow'
}: UtilizationChartProps) => {
  return (
    <Box>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item sx={{ mb: 2 }}>
          <Typography variant="h5">{title}</Typography>
        </Grid>
      </Grid>
      <Box sx={{ padding: '24px', background: 'white', border: '1px solid #e6ebf1' }}>
        <Box sx={{ mb: '40px', display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <SharedH4>{utilizationValue}</SharedH4>
            <ChartSubtitle>Utilization</ChartSubtitle>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot customColor={'#FA0'} />
              <ChartSubtitle sx={{ fontSize: '12px' }}>{legendOne}</ChartSubtitle>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot customColor={'#3392FF'} />
              <ChartSubtitle sx={{ fontSize: '12px' }}>{legendTwo}</ChartSubtitle>
            </Stack>
          </Box>
        </Box>
        <MainCard content={false}>
          <Box sx={{ pt: 1, pr: 2 }}>
            <IncomeAreaChart legendOne={legendOne} legendTwo={legendTwo} />
          </Box>
        </MainCard>
      </Box>
    </Box>
  );
};
