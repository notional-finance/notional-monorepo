// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

// project import
import MainCard from 'components/MainCard';
import AntAvatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

// assets
import MoreOutlined from '@ant-design/icons/MoreOutlined';

// ==============================|| LIST - USER ||============================== //

export default function UserList() {
  return (
    <MainCard content={false}>
      <List sx={{ p: 0 }}>
        <ListItem
          divider
          secondaryAction={
            <IconButton edge="end" aria-label="delete">
              <MoreOutlined />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src="/assets/images/users/avatar-4.png" />
          </ListItemAvatar>
          <ListItemText primary="Jone Doe" secondary="Developer" />
        </ListItem>
        <ListItem
          secondaryAction={
            <IconButton edge="end" aria-label="delete">
              <MoreOutlined />
            </IconButton>
          }
        >
          <ListItemAvatar>
            <AntAvatar alt="Avatar" src="/assets/images/users/avatar-5.png" />
          </ListItemAvatar>
          <ListItemText primary="Aidal Danny" secondary="Project Leader" />
        </ListItem>
      </List>
    </MainCard>
  );
}
