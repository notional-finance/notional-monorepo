// material-ui
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// project import
import MainCard from 'components/MainCard';

// assets
import LayoutOutlined from '@ant-design/icons/LayoutOutlined';
import FilePptOutlined from '@ant-design/icons/FilePptOutlined';
import RadiusUprightOutlined from '@ant-design/icons/RadiusUprightOutlined';

// ==============================|| LIST - BASIC ||============================== //

export default function BasicList() {
  return (
    <MainCard content={false}>
      <List sx={{ p: 0 }}>
        <ListItem disablePadding divider>
          <ListItemButton>
            <ListItemText primary="List item 01" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding divider>
          <ListItemButton>
            <ListItemText primary="List item 02" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding divider>
          <ListItemButton>
            <ListItemIcon>
              <LayoutOutlined />
            </ListItemIcon>
            <ListItemText primary="Sample" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding divider>
          <ListItemButton>
            <ListItemIcon>
              <FilePptOutlined />
            </ListItemIcon>
            <ListItemText primary="Page" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <RadiusUprightOutlined />
            </ListItemIcon>
            <ListItemText primary="UI Elements" />
          </ListItemButton>
        </ListItem>
      </List>
    </MainCard>
  );
}
