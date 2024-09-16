'use client';

// material-ui
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

// project import
import MainCard from 'components/MainCard';

// third-party
import { FixedSizeList, ListChildComponentProps } from 'react-window';

// ==============================|| SCROLLABLE - ITEMS ||============================== //

function renderRow({ index, style }: ListChildComponentProps) {
  return (
    <ListItem sx={style} key={index} disablePadding divider>
      <ListItemButton>
        <ListItemText primary={`Item ${index + 1}`} />
      </ListItemButton>
    </ListItem>
  );
}

// ==============================|| LIST - SCROLLABLE ||============================== //

export default function ScrollableList() {
  return (
    <MainCard content={false}>
      <Box sx={{ width: '100%', height: 400, bgcolor: 'background.paper' }}>
        <FixedSizeList height={400} width="100%" itemSize={46} itemCount={200} overscanCount={5}>
          {renderRow}
        </FixedSizeList>
      </Box>
    </MainCard>
  );
}
