import { useState } from 'react';

// material-ui
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

// assets
import BoldOutlined from '@ant-design/icons/BoldOutlined';
import ItalicOutlined from '@ant-design/icons/ItalicOutlined';
import UnderlineOutlined from '@ant-design/icons/UnderlineOutlined';
import BgColorsOutlined from '@ant-design/icons/BgColorsOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';

// ==============================|| TOGGLE BUTTON - MULTIPLE ||============================== //

export default function MultipleToggleButtons() {
  const [formats, setFormats] = useState(() => ['bold', 'italic']);

  const handleFormat = (event: React.MouseEvent<HTMLElement>, newFormats: string[]) => {
    setFormats(newFormats);
  };

  return (
    <ToggleButtonGroup value={formats} onChange={handleFormat} aria-label="text formatting">
      <ToggleButton value="bold" aria-label="bold">
        <BoldOutlined />
      </ToggleButton>
      <ToggleButton value="italic" aria-label="italic">
        <ItalicOutlined />
      </ToggleButton>
      <ToggleButton value="underlined" aria-label="underlined">
        <UnderlineOutlined />
      </ToggleButton>
      <ToggleButton value="color" aria-label="color" disabled>
        <BgColorsOutlined />
        <DownOutlined style={{ fontSize: '0.625rem', marginLeft: 6 }} />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
