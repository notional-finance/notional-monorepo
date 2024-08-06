import { useState } from 'react';

// material-ui
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

// project imports
import IconButton from 'components/@extended/IconButton';

// assets
import BackwardOutlined from '@ant-design/icons/BackwardOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import ForwardOutlined from '@ant-design/icons/ForwardOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';

// ==============================|| CHAT - MESSAGE ACTIONS ||============================== //

export default function ChatMessageAction({ index }: { index: number }) {
  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>(null);

  const handleClickSort = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseSort = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        id={`chat-action-button-${index}`}
        aria-controls={open ? `chat-action-menu-${index}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickSort}
        size="small"
        color="secondary"
      >
        <MoreOutlined />
      </IconButton>
      <Menu
        id={`chat-action-menu-${index}`}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleCloseSort}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        MenuListProps={{
          'aria-labelledby': `chat-action-button-${index}`
        }}
        sx={{
          p: 0,
          '& .MuiMenu-list': {
            p: 0
          }
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <BackwardOutlined />
          </ListItemIcon>
          <Typography>Reply</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ForwardOutlined />
          </ListItemIcon>
          <Typography>Forward</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <CopyOutlined />
          </ListItemIcon>
          <Typography>Copy</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DeleteOutlined />
          </ListItemIcon>
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
