// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

// project import
import MainCard from 'components/MainCard';
import AntAvatar from 'components/@extended/Avatar';

// assets
import AimOutlined from '@ant-design/icons/AimOutlined';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import FileSearchOutlined from '@ant-design/icons/FileSearchOutlined';

// ==============================|| LIST - FOLDER ||============================== //

export default function FolderList() {
  return (
    <MainCard content={false}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItem>
          <ListItemAvatar>
            <AntAvatar alt="Basic" type="combined" color="warning">
              <CameraOutlined />
            </AntAvatar>
          </ListItemAvatar>
          <ListItemText primary="Photos" secondary="Jan 9, 2014" />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <AntAvatar alt="Basic" type="combined">
              <FileSearchOutlined />
            </AntAvatar>
          </ListItemAvatar>
          <ListItemText primary="Work" secondary="Jan 7, 2014" />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <AntAvatar alt="Basic" type="combined" color="info">
              <AimOutlined />
            </AntAvatar>
          </ListItemAvatar>
          <ListItemText primary="Vacation" secondary="July 20, 2014" />
        </ListItem>
      </List>
    </MainCard>
  );
}
