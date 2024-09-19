import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { CopyToClipboard } from 'react-copy-to-clipboard';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import Transitions, { PopupTransition } from 'components/@extended/Transitions';

// assets
import CloseCircleTwoTone from '@ant-design/icons/CloseCircleTwoTone';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';

const discount = '/assets/images/e-commerce/discount.png';

// ==============================|| CHECKOUT - DISCOUNT COUPON CODE ||============================== //

interface CouponCodeProps {
  open: boolean;
  handleClose: () => void;
  setCoupon: (code: string) => void;
}

export default function CouponCode({ open, handleClose, setCoupon }: CouponCodeProps) {
  const [animate, setAnimate] = useState(false);

  const setDiscount = (code: string) => {
    setAnimate(true);
    setCoupon(code);
    setTimeout(() => {
      setAnimate(false);
    }, 2500);
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={PopupTransition}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      sx={{
        '& .MuiDialog-paper': {
          p: 0
        }
      }}
    >
      <MainCard
        title="Festival gift for your"
        secondary={
          <IconButton onClick={handleClose} size="large">
            <CloseCircleTwoTone style={{ fontSize: 'small' }} />
          </IconButton>
        }
      >
        <Grid container spacing={3}>
          {animate && (
            <Grid item xs={12}>
              <Transitions type="zoom" in={animate} direction="down">
                <Alert variant="outlined" severity="success" sx={{ borderColor: 'success.dark', color: 'success.dark' }}>
                  coupon copied
                </Alert>
              </Transitions>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <MainCard
              content={false}
              sx={{
                backgroundImage: `url(${discount})`,
                backgroundSize: 'contain',
                backgroundPosition: 'right',
                borderColor: 'secondary.200'
              }}
            >
              <CardContent>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Up to 50% Off</Typography>
                  </Grid>
                  <Grid item>
                    <AnimateButton>
                      <CopyToClipboard text="MANTIS50" onCopy={() => setDiscount('MANTIS50')}>
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          sx={{
                            bgcolor: 'secondary.light',
                            color: 'secondary.dark',
                            border: '2px dashed',
                            '&:hover': { border: '2px dashed', bgcolor: 'secondary.light' }
                          }}
                        >
                          MANTIS50
                        </Button>
                      </CopyToClipboard>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </CardContent>
            </MainCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <MainCard
              content={false}
              sx={{
                backgroundImage: `url(${discount})`,
                backgroundSize: 'contain',
                backgroundPosition: 'right',
                borderColor: 'error.light'
              }}
            >
              <CardContent>
                <Grid container alignItems="center" justifyContent="space-between" spacing={{ xs: 2, sm: 0 }}>
                  <Grid item>
                    <Typography variant="h4">Festival Fires</Typography>
                  </Grid>
                  <Grid item>
                    <AnimateButton>
                      <CopyToClipboard text="FLAT05" onCopy={() => setDiscount('FLAT05')}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{
                            bgcolor: 'orange.light',
                            color: 'error.main',
                            border: '2px dashed',
                            '&:hover': { border: '2px dashed', bgcolor: 'orange.light' }
                          }}
                        >
                          FLAT05
                        </Button>
                      </CopyToClipboard>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </CardContent>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={6} sm={2}>
                <Avatar color="primary" size="md" variant="rounded">
                  <GiftOutlined />
                </Avatar>
              </Grid>
              <Grid item xs={6} sm={2} sx={{ display: { xs: 'block', sm: 'none' } }}>
                <AnimateButton>
                  <CopyToClipboard text="SUB150" onCopy={() => setDiscount('SUB150')}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        border: '2px dashed',
                        '&:hover': { border: '2px dashed', bgcolor: 'primary.light' }
                      }}
                    >
                      SUB150
                    </Button>
                  </CopyToClipboard>
                </AnimateButton>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1">Get $150 off on your subscription</Typography>
                  <Typography variant="caption">When you subscribe to the unlimited consultation plan on mantis.</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <AnimateButton>
                  <CopyToClipboard text="SUB150" onCopy={() => setDiscount('SUB150')}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        border: '2px dashed',
                        '&:hover': { border: '2px dashed', bgcolor: 'primary.light' }
                      }}
                    >
                      SUB150
                    </Button>
                  </CopyToClipboard>
                </AnimateButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={6} sm={2}>
                <Avatar color="warning" size="md" variant="rounded">
                  <TrophyOutlined />
                </Avatar>
              </Grid>
              <Grid item xs={6} sm={2} sx={{ display: { xs: 'block', sm: 'none' } }}>
                <AnimateButton>
                  <CopyToClipboard text="UPTO200" onCopy={() => setDiscount('UPTO200')}>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      sx={{
                        bgcolor: 'warning.light',
                        color: 'warning.dark',
                        border: '2px dashed',
                        '&:hover': { border: '2px dashed', bgcolor: 'warning.light' }
                      }}
                    >
                      UPTO200
                    </Button>
                  </CopyToClipboard>
                </AnimateButton>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1">Save up to $200</Typography>
                  <Typography variant="caption">Make 4 play store recharge code purchases & save up to $200</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <AnimateButton>
                  <CopyToClipboard text="UPTO200" onCopy={() => setDiscount('UPTO200')}>
                    <Button
                      variant="outlined"
                      color="warning"
                      size="small"
                      sx={{
                        bgcolor: 'warning.light',
                        color: 'warning.dark',
                        border: '2px dashed',
                        '&:hover': { border: '2px dashed', bgcolor: 'warning.light' }
                      }}
                    >
                      UPTO200
                    </Button>
                  </CopyToClipboard>
                </AnimateButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
    </Dialog>
  );
}
