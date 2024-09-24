// next
import Image from 'next/image';
import NextLink from 'next/link';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import { APP_DEFAULT_PATH } from 'config';

// assets
const construction = '/assets/images/maintenance/under-construction.svg';

// ==============================--|| UNDER CONSTRUCTION - MAIN ||--============================== //

export default function UnderConstruction() {
  return (
    <Grid container spacing={4} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh', py: 2 }}>
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', width: { xs: 300, sm: 480 }, height: { xs: 265, sm: 430 } }}>
          <Image src={construction} alt="mantis" fill sizes="100vw" />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h1" align="center">
            Under Construction
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ width: { xs: '73%', sm: '82%' } }}>
            Hey! Please check out this site later. We are doing some maintenance on it right now.
          </Typography>
          <NextLink href={APP_DEFAULT_PATH} passHref legacyBehavior>
            <Button variant="contained">Back To Home</Button>
          </NextLink>
        </Stack>
      </Grid>
    </Grid>
  );
}
