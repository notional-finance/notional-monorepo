import { useState } from 'react';

// material-ui
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

// assets
import AlignLeftOutlined from '@ant-design/icons/AlignLeftOutlined';
import AlignCenterOutlined from '@ant-design/icons/AlignCenterOutlined';
import AlignRightOutlined from '@ant-design/icons/AlignRightOutlined';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';

// ==============================|| TOGGLE BUTTON - EXCLUSIVE ||============================== //

export default function ExclusiveToggleButtons() {
  const [alignment, setAlignment] = useState<string | null>('left');

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    setAlignment(newAlignment);
  };

  return (
    <ToggleButtonGroup value={alignment} exclusive onChange={handleAlignment} aria-label="text alignment">
      <ToggleButton value="left" aria-label="left aligned">
        <AlignLeftOutlined />
      </ToggleButton>
      <ToggleButton value="center" aria-label="centered">
        <AlignCenterOutlined />
      </ToggleButton>
      <ToggleButton value="right" aria-label="right aligned">
        <AlignRightOutlined />
      </ToggleButton>
      <ToggleButton value="list" aria-label="list" disabled sx={{ '&.Mui-disabled': { color: 'text.disabled' } }}>
        <UnorderedListOutlined />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
