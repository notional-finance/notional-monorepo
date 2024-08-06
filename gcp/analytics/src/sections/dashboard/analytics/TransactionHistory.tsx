// material-ui
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';

const avatar1 = '/assets/images/users/avatar-1.png';
const avatar2 = '/assets/images/users/avatar-2.png';
const avatar3 = '/assets/images/users/avatar-3.png';
const avatar4 = '/assets/images/users/avatar-4.png';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| TRANSACTION HISTORY ||============================== //

export default function TransactionHistory() {
  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Transaction History</Typography>
        </Grid>
        <Grid item />
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <List
          component="nav"
          sx={{
            p: 0,
            '& .MuiListItemButton-root': {
              py: 1.5,
              '& .MuiAvatar-root': avatarSX,
              '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
            }
          }}
        >
          <ListItemButton divider>
            <ListItemAvatar>
              <Avatar
                sx={{
                  color: 'success.main',
                  bgcolor: 'success.lighter'
                }}
              >
                <CheckOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Typography variant="subtitle1">Payment from #002434</Typography>} secondary="Today, 2:00 AM" />
            <ListItemSecondaryAction>
              <Stack alignItems="flex-end">
                <Typography variant="subtitle1" noWrap>
                  + $1,430
                </Typography>
                <Typography variant="h6" color="secondary" noWrap>
                  35%
                </Typography>
              </Stack>
            </ListItemSecondaryAction>
          </ListItemButton>
          <ListItemButton divider>
            <ListItemAvatar>
              <Avatar sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                <CloseOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Typography variant="subtitle1">Payment from #002434</Typography>} secondary="Today 6:00 AM" />
            <ListItemSecondaryAction>
              <Stack alignItems="flex-end">
                <Typography variant="subtitle1" noWrap>
                  - $1430
                </Typography>
                <Typography variant="h6" color="secondary" noWrap>
                  35%
                </Typography>
              </Stack>
            </ListItemSecondaryAction>
          </ListItemButton>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                <ClockCircleOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Typography variant="subtitle1">Pending from #002435</Typography>} secondary="Today 2:00 AM" />
            <ListItemSecondaryAction>
              <Stack alignItems="flex-end">
                <Typography variant="subtitle1" noWrap>
                  - $2430
                </Typography>
                <Typography variant="h6" color="secondary" noWrap>
                  35%
                </Typography>
              </Stack>
            </ListItemSecondaryAction>
          </ListItemButton>
        </List>
      </MainCard>
      <MainCard sx={{ mt: 2 }}>
        <Stack spacing={3}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Stack>
                <Typography variant="h5" noWrap>
                  Help & Support Chat
                </Typography>
                <Typography variant="caption" color="secondary" noWrap>
                  Typical replay within 5 min
                </Typography>
              </Stack>
            </Grid>
            <Grid item>
              <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                <Avatar alt="Remy Sharp" src={avatar1} />
                <Avatar alt="Travis Howard" src={avatar2} />
                <Avatar alt="Cindy Baker" src={avatar3} />
                <Avatar alt="Agnes Walker" src={avatar4} />
              </AvatarGroup>
            </Grid>
          </Grid>
          <Button size="small" variant="contained" sx={{ textTransform: 'capitalize', maxWidth: 'max-content', px: 2.25, py: 0.75 }}>
            Need Help?
          </Button>
        </Stack>
      </MainCard>
    </>
  );
}
