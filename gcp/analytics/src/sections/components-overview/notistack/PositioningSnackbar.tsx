'use client';

// material-ul
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

// project-import
import MainCard from 'components/MainCard';

// third-party
import { enqueueSnackbar } from 'notistack';

// ==============================|| NOTISTACK - POSTIONING ||============================== //

export default function PositioningSnackbar() {
  return (
    <MainCard title="Positioning">
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is default message.', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'left'
                }
              })
            }
          >
            Top-Left
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('his is success message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'center'
                }
              })
            }
          >
            Top-Center
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is warning message', {
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                }
              })
            }
          >
            Top-right
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is info message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left'
                }
              })
            }
          >
            Bottom-left
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is info message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'center'
                }
              })
            }
          >
            Bottom-center
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={() =>
              enqueueSnackbar('This is info message', {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                }
              })
            }
          >
            Bottom-Right
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
