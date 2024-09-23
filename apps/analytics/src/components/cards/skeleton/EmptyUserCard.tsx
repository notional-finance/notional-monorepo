// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import UserCard from './UserCard';

interface Props {
  title: string;
}

// ==============================|| EMPTY STATE ||============================== //

export default function EmptyUserCard({ title }: Props) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box
          sx={{
            p: { xs: 2.5, sm: 6 },
            height: `calc(100vh - 192px)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'transparent'
          }}
        >
          <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item>
              <Box sx={{ ml: -9, mb: { xs: -8, sm: -5 } }}>
                <Box sx={{ position: 'relative' }}>
                  <UserCard />
                </Box>
                <Box sx={{ position: 'relative', top: -120, left: 72 }}>
                  <UserCard />
                </Box>
              </Box>
            </Grid>
            <Grid item>
              <Stack spacing={1}>
                <Typography align="center" variant="h4">
                  {title}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
}
