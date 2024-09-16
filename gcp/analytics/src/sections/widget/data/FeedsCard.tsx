// next
import NextLink from 'next/link';

// material-ui
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import MessageFilled from '@ant-design/icons/MessageFilled';
import ShoppingFilled from '@ant-design/icons/ShoppingFilled';
import FileTextFilled from '@ant-design/icons/FileTextFilled';

// ==============================|| DATA WIDGET - FEEDS ||============================== //

export default function FeedsCard() {
  return (
    <MainCard
      title="Feeds"
      content={false}
      secondary={
        <NextLink href="#" passHref legacyBehavior>
          <Link color="primary">View all</Link>
        </NextLink>
      }
    >
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <MessageFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Grid container spacing={1}>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="secondary">
                      just now
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="error" type="filled" size="sm">
                    <ShoppingFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Grid container spacing={1}>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="secondary">
                      1 day ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="success" type="filled" size="sm">
                    <FileTextFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Grid container spacing={1}>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body2">You have 3 pending tasks.</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="secondary">
                      3 week ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="primary" type="filled" size="sm">
                    <MessageFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Grid container spacing={1}>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body2">New order received</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="secondary">
                      around month
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              <Grid item>
                <Box sx={{ position: 'relative' }}>
                  <Avatar color="warning" type="filled" size="sm">
                    <ShoppingFilled />
                  </Avatar>
                </Box>
              </Grid>
              <Grid item xs zeroMinWidth>
                <Grid container spacing={1}>
                  <Grid item xs zeroMinWidth>
                    <Typography variant="body2">Order cancelled</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="secondary">
                      2 month ago
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </MainCard>
  );
}
