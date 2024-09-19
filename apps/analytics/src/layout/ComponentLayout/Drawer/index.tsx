'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';

// project import
import DrawerContent from './DrawerContent';
import MainCard from 'components/MainCard';

import { DRAWER_WIDTH } from 'config';
import { handlerComponentDrawer, useGetMenuMaster } from 'api/menu';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// ==============================|| COMPONENTS - DRAWER ||============================== //

export default function Drawer() {
  const theme = useTheme();
  const { menuMaster } = useGetMenuMaster();
  const open = menuMaster.isComponentDrawerOpened;

  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const [searchValue, setSearchValue] = useState();

  const handleSearchValue = (event: any) => {
    const search = event.target.value.trim().toLowerCase();
    setSearchValue(search);
  };

  return (
    <MuiDrawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        position: { xs: 'fixed', md: 'sticky' },
        top: { xs: 0, md: 84, xl: 90 },
        height: { xs: 'auto', md: 'calc(100vh - 140px)', xl: 'calc(100vh - 176px)' },
        zIndex: { xs: open ? 1200 : -1, md: 0 },
        '& .MuiDrawer-paper': {
          position: 'relative',
          border: 'none'
        }
      }}
      variant={downMD ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={() => handlerComponentDrawer(false)}
    >
      <MainCard sx={{ height: '100%' }} content={false}>
        <Box sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            sx={{
              borderRadius: '4px',
              bgcolor: 'background.paper',
              boxShadow: theme.customShadows.primary,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
            InputProps={{
              startAdornment: <SearchOutlined />,
              placeholder: 'Search Components',
              type: 'search'
            }}
            onChange={handleSearchValue}
          />
        </Box>
        <DrawerContent searchValue={searchValue} />
      </MainCard>
    </MuiDrawer>
  );
}
