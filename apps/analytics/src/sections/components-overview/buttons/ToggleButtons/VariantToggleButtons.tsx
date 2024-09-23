import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

// ==============================|| TOGGLE BUTTON - VARIANT ||============================== //

export default function VariantToggleButtons() {
  const theme = useTheme();
  const [alignment, setAlignment] = useState<string | null>('web');

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setAlignment(newAlignment);
    }
  };

  return (
    <ToggleButtonGroup
      value={alignment}
      color="primary"
      exclusive
      onChange={handleAlignment}
      aria-label="text alignment"
      sx={{
        '& .MuiToggleButton-root': {
          '&:not(.Mui-selected)': {
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent'
          },
          '&:first-of-type': {
            borderLeftColor: 'transparent'
          },
          '&:last-of-type': {
            borderRightColor: 'transparent'
          },
          '&.Mui-selected': {
            borderColor: 'inherit',
            borderLeftColor: `${theme.palette.primary.main} !important`,
            '&:hover': {
              bgcolor: 'primary.lighter'
            }
          },
          '&:hover': {
            bgcolor: 'transparent',
            borderColor: 'primary.main',
            borderLeftColor: `${theme.palette.primary.main} !important`,
            zIndex: 2
          }
        }
      }}
    >
      <ToggleButton value="web" aria-label="web">
        Web
      </ToggleButton>
      <ToggleButton value="android" aria-label="android">
        Android
      </ToggleButton>
      <ToggleButton value="ios" aria-label="ios">
        iOS
      </ToggleButton>
      <ToggleButton value="all" aria-label="all">
        All
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
