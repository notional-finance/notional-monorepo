'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

// project import
import MainCard from 'components/MainCard';

// assets
import CopyTwoTone from '@ant-design/icons/CopyTwoTone';
import EditOutlined from '@ant-design/icons/EditOutlined';
import SaveTwoTone from '@ant-design/icons/SaveTwoTone';
import PrinterTwoTone from '@ant-design/icons/PrinterTwoTone';
import HeartTwoTone from '@ant-design/icons/HeartTwoTone';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';

// =============================|| SPEEDDIAL - CUSTOM CLOSE ICON ||============================= //

export default function OpenIconSpeedDial() {
  const theme = useTheme();

  // fab action options
  const actions = [
    { icon: <CopyTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Copy' },
    { icon: <SaveTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Save' },
    { icon: <PrinterTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Print' },
    { icon: <ShareAltOutlined style={{ color: theme.palette.grey[600], fontSize: '1.15rem' }} />, name: 'Share' },
    { icon: <HeartTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Like' }
  ];

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [hidden, setHidden] = useState(false);
  const handleVisibility = () => {
    setHidden((prevHidden) => !prevHidden);
  };

  return (
    <MainCard title="Custom Close Icon">
      <Box sx={{ height: 430, transform: 'translateZ(0px)', flexGrow: 1 }}>
        <Button onClick={handleVisibility}>Toggle Speed Dial</Button>
        <SpeedDial
          ariaLabel="SpeedDial openIcon example"
          hidden={hidden}
          icon={<SpeedDialIcon openIcon={<EditOutlined style={{ fontSize: '1.3rem' }} />} />}
          onClose={handleClose}
          onOpen={handleOpen}
          open={open}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            '& .MuiSpeedDialAction-fab': {
              bgcolor: 'secondary.200'
            }
          }}
        >
          {actions.map((action) => (
            <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} onClick={handleClose} />
          ))}
        </SpeedDial>
      </Box>
    </MainCard>
  );
}
