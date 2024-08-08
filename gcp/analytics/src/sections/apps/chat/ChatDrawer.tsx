import { useState } from 'react';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import UserAvatar from './UserAvatar';
import UserList from './UserList';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';

import { ThemeMode } from 'config';
import useUser from 'hooks/useUser';

// types
import { UserProfile } from 'types/user-profile';

// assets
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled';
import ClockCircleFilled from '@ant-design/icons/ClockCircleFilled';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import MinusCircleFilled from '@ant-design/icons/MinusCircleFilled';
import RightOutlined from '@ant-design/icons/RightOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

// ==============================|| CHAT DRAWER ||============================== //

interface ChatDrawerProps {
  handleDrawerOpen: () => void;
  openChatDrawer: boolean | undefined;
  setUser: (u: UserProfile) => void;
  selectedUser: string | null;
}

export default function ChatDrawer({ handleDrawerOpen, openChatDrawer, setUser, selectedUser }: ChatDrawerProps) {
  const theme = useTheme();
  const user = useUser();

  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const drawerBG = theme.palette.mode === ThemeMode.DARK ? 'dark.main' : 'white';

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState<Element | (() => Element) | null | undefined>();
  const handleClickRightMenu = (event: React.MouseEvent<HTMLButtonElement> | undefined) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseRightMenu = () => {
    setAnchorEl(null);
  };

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = (userStatus: string) => () => {
    setStatus(userStatus);
    handleCloseRightMenu();
  };

  const [search, setSearch] = useState<string | undefined>('');
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | undefined) => {
    const newString = event?.target.value;
    setSearch(newString);
  };

  return (
    <Drawer
      sx={{
        mt: { xs: 7.5, lg: 0 },
        width: 320,
        flexShrink: 0,
        zIndex: { xs: openChatDrawer ? 1100 : -1, lg: 0 },
        '& .MuiDrawer-paper': {
          height: downLG ? '100%' : 'auto',
          width: 320,
          boxSizing: 'border-box',
          position: 'relative',
          border: 'none'
        }
      }}
      variant={downLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openChatDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      <MainCard
        sx={{
          bgcolor: downLG ? 'transparent' : drawerBG,
          borderRadius: '4px 0 0 4px',
          borderRight: 'none'
        }}
        border={!downLG}
        content={false}
      >
        <Box sx={{ p: 3, pb: 1 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="h5" color="inherit">
                Messages
              </Typography>
              <Chip
                label="9"
                color="secondary"
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  '& .MuiChip-label': {
                    px: 0.5
                  }
                }}
              />
            </Stack>

            <OutlinedInput
              fullWidth
              id="input-search-header"
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              sx={{
                '& .MuiOutlinedInput-input': {
                  p: '10.5px 0px 12px',
                  color: 'darkgray'
                }
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchOutlined style={{ fontSize: 'small' }} />
                </InputAdornment>
              }
            />
          </Stack>
        </Box>

        <SimpleBar
          sx={{
            overflowX: 'hidden',
            height: downLG ? 'calc(100vh - 354px)' : 'calc(100vh - 402px)',
            minHeight: downLG ? 0 : 420
          }}
        >
          <Box sx={{ p: 3, py: 0 }}>
            <UserList setUser={setUser} search={search} selectedUser={selectedUser} />
          </Box>
        </SimpleBar>
        <Box sx={{ px: 3 }}>
          <List component="nav">
            <ListItemButton divider>
              <ListItemIcon>
                <LogoutOutlined />
              </ListItemIcon>

              <ListItemText primary="LogOut" />
            </ListItemButton>
            <ListItemButton divider>
              <ListItemIcon>
                <SettingOutlined />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </List>
        </Box>

        <Box sx={{ p: 3, pt: 1, pl: 5 }}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container spacing={1} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                <Grid item>
                  <UserAvatar user={{ online_status: status, avatar: 'avatar-1.png', name: 'User 1' }} />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <NextLink href="/apps/profiles/user/personal" passHref legacyBehavior>
                    {user && (
                      <Stack sx={{ cursor: 'pointer', textDecoration: 'none' }}>
                        <Typography variant="h5" color="text.primary">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.role}
                        </Typography>
                      </Stack>
                    )}
                  </NextLink>
                </Grid>
                <Grid item>
                  <IconButton onClick={handleClickRightMenu} size="small" color="secondary">
                    <RightOutlined />
                  </IconButton>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseRightMenu}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                    sx={{
                      '& .MuiMenu-list': {
                        p: 0
                      },
                      '& .MuiMenuItem-root': {
                        pl: '6px',
                        py: '3px'
                      }
                    }}
                  >
                    <MenuItem onClick={handleRightMenuItemClick('available')}>
                      <IconButton
                        size="small"
                        sx={{
                          color: 'success.main',
                          '&:hover': { color: 'success.main', bgcolor: 'transparent', transition: 'none', padding: 0 }
                        }}
                      >
                        <CheckCircleFilled />
                      </IconButton>
                      <Typography>Active</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleRightMenuItemClick('offline')}>
                      <IconButton
                        size="small"
                        sx={{
                          color: 'warning.main',
                          '&:hover': { color: 'warning.main', bgcolor: 'transparent', transition: 'none', padding: 0 }
                        }}
                      >
                        <ClockCircleFilled />
                      </IconButton>
                      <Typography>Away</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleRightMenuItemClick('do_not_disturb')}>
                      <IconButton
                        size="small"
                        sx={{
                          color: 'grey.400',
                          '&:hover': { color: 'grey.400', bgcolor: 'transparent', transition: 'none', padding: 0 }
                        }}
                      >
                        <MinusCircleFilled />
                      </IconButton>
                      <Typography>Do not disturb</Typography>
                    </MenuItem>
                  </Menu>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Drawer>
  );
}
