// material-ui
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// project import
import MainCard from 'components/MainCard';

// ==============================|| DATE PICKER - NATIVE ||============================== //

export default function NativePickers() {
  return (
    <MainCard title="Native Picker">
      <Stack component="form" noValidate spacing={3}>
        <TextField
          id="date"
          placeholder="Birthday"
          type="date"
          defaultValue="2017-05-24"
          sx={{ width: 220 }}
          InputLabelProps={{
            shrink: true
          }}
        />
        <TextField
          id="time"
          placeholder="Alarm Clock"
          type="time"
          defaultValue="07:30"
          InputLabelProps={{
            shrink: true
          }}
          inputProps={{
            step: 300 // 5 min
          }}
          sx={{ width: 150 }}
        />
        <TextField
          id="datetime-local"
          placeholder="Next Appointment"
          type="datetime-local"
          defaultValue="2017-05-24T10:30"
          sx={{ width: 250 }}
          InputLabelProps={{
            shrink: true
          }}
        />
      </Stack>
    </MainCard>
  );
}
