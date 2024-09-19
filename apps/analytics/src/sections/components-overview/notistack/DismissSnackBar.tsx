'use client';

// material-ul
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// third party
import { enqueueSnackbar, useSnackbar } from 'notistack';

// project import
import MainCard from 'components/MainCard';

// ==============================|| NOTISTACK - DISMISS ||============================== //

export default function DismissSnackBar() {
  const { closeSnackbar } = useSnackbar();

  return (
    <MainCard title="Dismiss Programmatically">
      <Stack flexDirection={'row'} justifyContent={'space-between'}>
        <Button
          variant="outlined"
          fullWidth
          color="error"
          sx={{ marginBlockStart: 2, marginInlineEnd: 2 }}
          onClick={() =>
            enqueueSnackbar('No connection!', {
              variant: 'error',
              persist: true,
              anchorOrigin: { horizontal: 'center', vertical: 'bottom' }
            })
          }
        >
          Simulate connection loss
        </Button>
        <Button variant="outlined" fullWidth sx={{ marginBlockStart: 2 }} onClick={() => closeSnackbar()}>
          Back Online
        </Button>
      </Stack>
    </MainCard>
  );
}
