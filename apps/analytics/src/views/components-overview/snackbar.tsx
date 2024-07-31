'use client';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

import {
  ColorVariants,
  CustomComponent,
  Dense,
  DismissSnackBar,
  HideDuration,
  IconVariants,
  MaxSnackbar,
  PositioningSnackbar,
  PreventDuplicate,
  SnackBarAction,
  TransitionBar
} from 'sections/components-overview/notistack';

import { openSnackbar } from 'api/snackbar';

// types
import { SnackbarProps } from 'types/snackbar';

// ==============================|| COMPONENTS - SNACKBAR ||============================== //

export default function ComponentSnackbar() {
  return (
    <>
      <ComponentHeader
        title="Snackbar"
        caption="Snackbars provide brief notifications. The component is also known as a toast."
        directory="src/pages/components-overview/snackbar"
        link="https://mui.com/material-ui/react-snackbar/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <MainCard title="Basic">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is default message',
                        variant: 'alert'
                      } as SnackbarProps)
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is secondary message',
                        variant: 'alert',
                        alert: { color: 'secondary' }
                      } as SnackbarProps)
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is success message',
                        variant: 'alert',
                        alert: {
                          color: 'success'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is warning message',
                        variant: 'alert',
                        alert: {
                          color: 'warning'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is info message',
                        variant: 'alert',
                        alert: {
                          color: 'info'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is error message',
                        variant: 'alert',
                        alert: {
                          color: 'error'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Outlined">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is default message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is secondary message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'secondary'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is success message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'success'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is warning message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'warning'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is info message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'info'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is error message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'error'
                        }
                      } as SnackbarProps)
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="With Close">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is default message',
                        variant: 'alert',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is secondary message',
                        variant: 'alert',
                        alert: { color: 'secondary' },
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is success message',
                        variant: 'alert',
                        alert: {
                          color: 'success'
                        },
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is warning message',
                        variant: 'alert',
                        alert: {
                          color: 'warning'
                        },
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is info message',
                        variant: 'alert',
                        alert: {
                          color: 'info'
                        },
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is error message',
                        variant: 'alert',
                        alert: {
                          color: 'error'
                        },
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="With Close + Action">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is default message',
                        variant: 'alert',
                        actionButton: true,
                        close: true,
                        alert: { variant: 'outlined' }
                      } as SnackbarProps)
                    }
                  >
                    Default
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is secondary message',
                        variant: 'alert',
                        actionButton: true,
                        close: true,
                        alert: { color: 'secondary', variant: 'outlined' }
                      } as SnackbarProps)
                    }
                  >
                    Secondary
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is success message',
                        variant: 'alert',
                        alert: {
                          variant: 'outlined',
                          color: 'success'
                        },
                        actionButton: true,
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Success
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is warning message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'warning' },
                        actionButton: true,
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Warning
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is info message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'info' },
                        actionButton: true,
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Info
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is error message',
                        variant: 'alert',
                        alert: { variant: 'outlined', color: 'error' },
                        actionButton: true,
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Error
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Position">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'left' },
                        message: 'This is an top-left message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Top-Left
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'center' },
                        message: 'This is an top-center message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Top-Center
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'This is an top-right message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Top-Right
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
                        message: 'This is an bottom-right message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Bottom-Right
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
                        message: 'This is an bottom-center message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Bottom-Center
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                        message: 'This is an bottom-left message!',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Bottom-Left
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard title="Transitions">
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an fade message!',
                        transition: 'Fade',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Default/Fade
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an slide-left message!',
                        transition: 'SlideLeft',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Slide Left
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an slide-up message!',
                        transition: 'SlideUp',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Slide Up
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an slide-right message!',
                        transition: 'SlideRight',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Slide Right
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an slide-down message!',
                        transition: 'SlideDown',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Slide Down
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() =>
                      openSnackbar({
                        open: true,
                        message: 'This is an grow message!',
                        transition: 'Grow',
                        close: true
                      } as SnackbarProps)
                    }
                  >
                    Grow
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mt: 2 }}>
              Extended - Notistack
            </Typography>
          </Grid>
          <Grid item xs={12} lg={6}>
            <ColorVariants />
          </Grid>
          <Grid item xs={12} lg={6}>
            <MaxSnackbar />
          </Grid>
          <Grid item xs={12} lg={6}>
            <IconVariants />
          </Grid>
          <Grid item xs={12} lg={6}>
            <HideDuration />
          </Grid>
          <Grid item xs={12} lg={6}>
            <SnackBarAction />
          </Grid>
          <Grid item xs={12} lg={6}>
            <DismissSnackBar />
          </Grid>
          <Grid item xs={12} lg={6}>
            <PreventDuplicate />
          </Grid>
          <Grid item xs={12} lg={6}>
            <TransitionBar />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Dense />
          </Grid>
          <Grid item xs={12} lg={6}>
            <CustomComponent />
          </Grid>
          <Grid item xs={12} lg={6}>
            <PositioningSnackbar />
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}
