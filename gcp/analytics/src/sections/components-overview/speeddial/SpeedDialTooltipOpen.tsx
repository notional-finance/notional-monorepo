'use client';

import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// assets
import CopyTwoTone from '@ant-design/icons/CopyTwoTone';
import SaveTwoTone from '@ant-design/icons/SaveTwoTone';
import PrinterTwoTone from '@ant-design/icons/PrinterTwoTone';
import HeartTwoTone from '@ant-design/icons/HeartTwoTone';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';

// =============================|| SPEEDDIAL - PERSISTENT ICON ||============================= //

export default function SpeedDialTooltipOpen() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  // fab action options
  const actions = [
    { icon: <CopyTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Copy' },
    { icon: <SaveTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Save' },
    { icon: <PrinterTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Print' },
    { icon: <ShareAltOutlined style={{ color: theme.palette.grey[600], fontSize: '1.15rem' }} />, name: 'Share' },
    { icon: <HeartTwoTone twoToneColor={theme.palette.grey[600]} style={{ fontSize: '1.15rem' }} />, name: 'Like' }
  ];

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
    <MainCard title="Persistent Icon">
      <Box sx={{ height: 430, transform: 'translateZ(0px)', flexGrow: 1 }}>
        <Button onClick={handleVisibility}>Toggle Speed Dial</Button>
        <Backdrop open={open} />
        <SpeedDial
          ariaLabel="SpeedDial tooltip example"
          hidden={hidden}
          icon={<SpeedDialIcon />}
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
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={<Typography variant="subtitle1">{action.name}</Typography>}
              tooltipOpen
              onClick={handleClose}
            />
          ))}
        </SpeedDial>
      </Box>
    </MainCard>
  );
}
