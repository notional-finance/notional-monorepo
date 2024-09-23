'use client';

// next
import Image from 'next/legacy/image';
import NextLink from 'next/link';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import { APP_DEFAULT_PATH } from 'config';

// assets
const error500 = '/assets/images/maintenance/Error500.png';

// ==============================|| ERROR 500 - MAIN ||============================== //

export default function Error500() {
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12}>
        <Box sx={{ width: { xs: 350, sm: 396 } }}>
          <Image src={error500} alt="mantis" layout="fixed" width={downSM ? 350 : 396} height={downSM ? 325 : 370} />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack justifyContent="center" alignItems="center">
          <Typography align="center" variant={downSM ? 'h2' : 'h1'}>
            Internal Server Error
          </Typography>
          <Typography color="text.secondary" variant="body2" align="center" sx={{ width: { xs: '73%', sm: '70%' }, mt: 1 }}>
            Server error 500. we fixing the problem. please try again at a later stage.
          </Typography>
          <NextLink href={APP_DEFAULT_PATH} passHref legacyBehavior>
            <Button variant="contained" sx={{ textTransform: 'none', mt: 4 }}>
              Back To Home
            </Button>
          </NextLink>
        </Stack>
      </Grid>
    </Grid>
  );
}
