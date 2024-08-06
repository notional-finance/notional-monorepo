// next
import NextLink from 'next/link';
import Image from 'next/image';

// material-ui
import { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import { Chance } from 'chance';

// project-imports
import MainCard from 'components/MainCard';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
const completed = '/assets/images/e-commerce/completed.png';

const chance = new Chance();

// ==============================|| CHECKOUT - ORDER COMPLETE ||============================== //

export default function OrderComplete({ open }: { open: boolean }) {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      fullScreen
      TransitionComponent={PopupTransition}
      sx={{ '& .MuiDialog-paper': { bgcolor: 'background.paper', backgroundImage: 'none' } }}
    >
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
        <Grid item>
          <MainCard border={false}>
            <Stack spacing={2} alignItems="center">
              <Box sx={{ position: 'relative', width: { xs: 320, sm: 500 } }}>
                <Image
                  src={completed}
                  alt="Order Complete"
                  width={downMD ? 320 : 500}
                  height={downMD ? 200 : 312}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              <Typography variant={downMD ? 'h3' : 'h1'} align="center">
                Thank you for Purchase!
              </Typography>
              <Box sx={{ px: 2.5 }}>
                <Typography align="center" color="text.secondary">
                  We will send a process notification, before it delivered.
                </Typography>
                <Typography align="center" color="text.secondary">
                  Your order id:{' '}
                  <Typography variant="subtitle1" component="span" color="primary">
                    {chance.guid()}
                  </Typography>
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ py: { xs: 1, sm: 3 } }}>
                (219) 404-5468
              </Typography>
              <Stack direction="row" justifyContent="center" spacing={3}>
                <NextLink href="/apps/e-commerce/products" passHref legacyBehavior>
                  <Button variant="outlined" color="secondary" size={downMD ? 'small' : 'medium'}>
                    Continue Shopping
                  </Button>
                </NextLink>
                <NextLink href="/apps/e-commerce/products" passHref legacyBehavior>
                  <Button variant="contained" color="primary" size={downMD ? 'small' : 'medium'}>
                    Download Invoice
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Dialog>
  );
}
