'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import IncomeChart from 'sections/dashboard/analytics/IncomeChart';

// assets
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';

interface IncomeOverviewCardProps {
  selectedListItem?: string | null;
  selectedChildItem?: string | null;
}

export default function IncomeOverviewCard({ selectedListItem, selectedChildItem }: IncomeOverviewCardProps) {
  const theme = useTheme();
  const [slot, setSlot] = useState('week');

  const handleChange = (event: React.MouseEvent<HTMLElement>, newAlignment: string) => {
    if (newAlignment) setSlot(newAlignment);
  };

  return (
    <MainCard content={false} border={false}>
      <Grid item>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <Stack sx={{ ml: { xs: 0, sm: 2 } }} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Typography color="text.secondary" sx={{ display: 'block', span: { fontWeight: 600, color: 'black' } }}>
                <span>{`${selectedChildItem}`}</span> {`(${selectedListItem})`}
              </Typography>
              <Stack direction="row" alignItems="center">
                <CaretDownOutlined style={{ color: theme.palette.error.main, paddingRight: '4px' }} />
                <Typography color="error.main">$1,12,900 (45.67%)</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'flex-end' }}
              sx={{ mt: 3, mr: { xs: 0, sm: 2 } }}
            >
              <ToggleButtonGroup exclusive onChange={handleChange} size="small" value={slot}>
                <ToggleButton disabled={slot === 'week'} value="week" sx={{ px: 2, py: 0.5 }}>
                  Week
                </ToggleButton>
                <ToggleButton disabled={slot === 'month'} value="month" sx={{ px: 2, py: 0.5 }}>
                  Month
                </ToggleButton>
                <ToggleButton disabled={slot === 'year'} value="year" sx={{ px: 2, py: 0.5 }}>
                  Year
                </ToggleButton>
                <ToggleButton disabled={slot === 'all'} value="all" sx={{ px: 2, py: 0.5 }}>
                  All
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      <Box sx={{ pt: 1 }}>
        <IncomeChart slot={slot} quantity={'By volume'} />
      </Box>
    </MainCard>
  );
}
