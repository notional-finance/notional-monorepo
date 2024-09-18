import { useState, MouseEvent } from 'react';

// material-ui
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';

// ==============================|| TOGGLE BUTTON - VERTICAL ||============================== //

export default function VerticalToggleButtons() {
  const [view, setView] = useState('tree');

  const handleChange = (event: MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
  };

  return (
    <ToggleButtonGroup orientation="vertical" value={view} exclusive onChange={handleChange}>
      <ToggleButton value="tree" aria-label="tree">
        <ApartmentOutlined />
      </ToggleButton>
      <ToggleButton value="grid" aria-label="grid">
        <AppstoreOutlined />
      </ToggleButton>
      <ToggleButton value="table" aria-label="table">
        <TableOutlined />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
