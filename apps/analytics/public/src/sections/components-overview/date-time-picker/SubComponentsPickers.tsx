'use client';

import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { MonthCalendar } from '@mui/x-date-pickers/MonthCalendar';
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// project import
import MainCard from 'components/MainCard';

const minDate = new Date('2020-01-01T00:00:00.000');
const maxDate = new Date('2034-01-01T00:00:00.000');

// ==============================|| DATE PICKER - SUB COMPONENT ||============================== //

export default function SubComponentsPickers() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <MainCard title="Sub Component">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3} justifyContent="center" alignItems="center">
          <Box sx={{ maxWidth: 320 }}>
            <YearCalendar value={date} minDate={minDate} maxDate={maxDate} onChange={(newDate: Date) => setDate(newDate)} />
          </Box>
          <Box sx={{ maxWidth: 320 }}>
            <MonthCalendar
              value={date}
              minDate={minDate}
              maxDate={maxDate}
              onChange={(newDate: Date) => setDate(newDate)}
              sx={{ m: 'auto' }}
            />
          </Box>
          <Box sx={{ maxWidth: 320 }}>
            <DateCalendar value={date} onChange={(newDate: Date | null) => setDate(newDate)} />
          </Box>
        </Stack>
      </LocalizationProvider>
    </MainCard>
  );
}
