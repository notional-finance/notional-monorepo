// material-ui
import Stack from '@mui/material/Stack';

// project-import
import CircularWithPath from './@extended/progress/CircularWithPath';

// ==============================|| LOADER - CIRCULAR ||============================== //

export default function CircularLoader() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
      <CircularWithPath />
    </Stack>
  );
}
