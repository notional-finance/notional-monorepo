// next
import NextLink from 'next/link';

// material-ui
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

export default function InvoiceNotificationList() {
  const iconSX = { fontSize: '1rem' };

  return (
    <MainCard
      title="Notification"
      secondary={
        <IconButton edge="end" aria-label="comments" color="secondary">
          <MoreOutlined style={{ fontSize: '1.15rem' }} />
        </IconButton>
      }
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 1" color="success">
                <DownloadOutlined />
              </Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography variant="subtitle1">
                Johnny sent you an invoice billed{' '}
                <NextLink href="/" passHref legacyBehavior>
                  <Link underline="hover">$1,000.</Link>
                </NextLink>
              </Typography>
              <Typography variant="caption" color="secondary">
                2 August
              </Typography>
            </Grid>
            <Grid item sx={{ color: 'text.secondary' }}>
              <LinkOutlined style={iconSX} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 2">
                <FileTextOutlined />
              </Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography variant="subtitle1">
                Sent an invoice to Aida Bugg amount of{' '}
                <NextLink href="/" passHref legacyBehavior>
                  <Link underline="hover">$200.</Link>
                </NextLink>
              </Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid item sx={{ color: 'text.secondary' }}>
              <LinkOutlined style={iconSX} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 2" color="error">
                <SettingOutlined />
              </Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography variant="subtitle1">There was a failure to your setup</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid item sx={{ color: 'text.secondary' }}>
              <LinkOutlined style={iconSX} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 2">C</Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography variant="subtitle1">Cristina danny invited to you join Meeting</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid item sx={{ color: 'text.secondary' }}>
              <LinkOutlined style={iconSX} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt="User 2">C</Avatar>
            </Grid>
            <Grid item xs zeroMinWidth>
              <Typography variant="subtitle1">Cristina danny invited to you join Meeting</Typography>
              <Typography variant="caption" color="secondary">
                7 hours ago
              </Typography>
            </Grid>
            <Grid item sx={{ color: 'text.secondary' }}>
              <LinkOutlined style={iconSX} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Button fullWidth variant="outlined" color="secondary">
            View All
          </Button>
        </Grid>
      </Grid>
    </MainCard>
  );
}
