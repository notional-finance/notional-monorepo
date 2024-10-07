'use client';

import { forwardRef, useState, Ref } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { TransitionProps } from '@mui/material/transitions';

// project import
import IconButton from 'components/@extended/IconButton';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';

function transition(props: TransitionProps & { children: React.ReactElement }, ref: Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
}

const Transition = forwardRef(transition);

// ==============================|| DIALOG - FULL SCREEN ||============================== //

export default function FullScreenDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        Open full-screen dialog
      </Button>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar sx={{ position: 'relative', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseOutlined />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              Set Backup Account
            </Typography>
            <Button color="primary" variant="contained" onClick={handleClose}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <List sx={{ p: 3 }}>
          <ListItemButton>
            <ListItemAvatar>
              <Avatar src="/assets/images/users/avatar-1.png" />
            </ListItemAvatar>
            <ListItemText primary="Phone ringtone" secondary="Default" />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemAvatar>
              <Avatar src="/assets/images/users/avatar-2.png" />
            </ListItemAvatar>
            <ListItemText primary="Default notification ringtone" secondary="Tethys" />
          </ListItemButton>
        </List>
      </Dialog>
    </>
  );
}
