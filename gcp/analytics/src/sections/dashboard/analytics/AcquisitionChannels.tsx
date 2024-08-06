// material-ui
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import AcquisitionChart from './AcquisitionChart';
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';

// assets
import FundProjectionScreenOutlined from '@ant-design/icons/FundProjectionScreenOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';

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

// ==============================|| ANALYTICS - ACQUISITION CHANNELS ||============================== //

export default function AcquisitionChannels() {
  return (
    <MainCard content={false}>
      <Stack>
        <List sx={{ p: 0, '& .MuiListItemButton-root': { pt: 2, pb: 0 } }}>
          <ListItemButton sx={{ '&:hover': { bgcolor: 'transparent' }, cursor: 'text' }}>
            <ListItemText
              primary={<Typography variant="subtitle1">Acquisition Channels</Typography>}
              secondary={
                <Typography color="text.secondary" variant="caption" sx={{ display: 'inline' }}>
                  Marketing
                </Typography>
              }
            />
            <Typography variant="h5" color="primary">
              -128
            </Typography>
          </ListItemButton>
        </List>
        <Box sx={{ pr: 2 }}>
          <AcquisitionChart />
        </Box>

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
              <Avatar sx={{ color: 'grey.900', bgcolor: 'grey.200' }}>
                <FundProjectionScreenOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Typography variant="subtitle1">Top Channels</Typography>} secondary="Today, 2:00 AM" />
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
              <Avatar
                sx={{
                  color: 'primary.main',
                  bgcolor: 'primary.lighter'
                }}
              >
                <FileTextOutlined />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<Typography variant="subtitle1">Top Pages</Typography>} secondary="Today 6:00 AM" />
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
        </List>
      </Stack>
    </MainCard>
  );
}
