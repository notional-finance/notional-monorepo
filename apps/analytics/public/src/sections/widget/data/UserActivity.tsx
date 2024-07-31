// next
import NextLink from 'next/link';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';

// assets
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

const Avatar1 = '/assets/images/users/avatar-5.png';
const Avatar2 = '/assets/images/users/avatar-6.png';
const Avatar3 = '/assets/images/users/avatar-7.png';

// ===========================|| DATA WIDGET - USER ACTIVITY CARD ||=========================== //

export default function UserActivity() {
  const iconSX = {
    fontSize: '0.675rem'
  };

  return (
    <MainCard
      title="User Activity"
      content={false}
      secondary={
        <NextLink href="#" passHref legacyBehavior>
          <Link color="primary">View all</Link>
        </NextLink>
      }
    >
      <CardContent>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Badge
                  variant="dot"
                  overlap="circular"
                  color="error"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                >
                  <Avatar alt="image" src={Avatar1} />
                </Badge>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="secondary">
                    now
                  </Typography>
                  <ClockCircleOutlined style={iconSX} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Badge
                    variant="dot"
                    overlap="circular"
                    color="success"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <Avatar alt="image" src={Avatar2} />
                  </Badge>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="secondary">
                    2 min ago
                  </Typography>
                  <ClockCircleOutlined style={iconSX} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Badge
                    variant="dot"
                    overlap="circular"
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <Avatar alt="image" src={Avatar3} />
                  </Badge>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="secondary">
                    1 day ago
                  </Typography>
                  <ClockCircleOutlined style={iconSX} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Badge
                    variant="dot"
                    overlap="circular"
                    color="warning"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                  >
                    <Avatar alt="image" src={Avatar1} />
                  </Badge>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography variant="subtitle1">John Deo</Typography>
                <Typography variant="caption" color="secondary">
                  Lorem Ipsum is simply dummy text.
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="secondary">
                    3 week ago
                  </Typography>
                  <ClockCircleOutlined style={iconSX} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
