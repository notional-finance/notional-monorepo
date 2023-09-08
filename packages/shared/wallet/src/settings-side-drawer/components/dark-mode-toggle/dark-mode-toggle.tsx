import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';

export const DarkModeToggle = () => {
  const { updateNotional } = useNotionalContext();
  const userSettings = getFromLocalStorage('userSettings');
  const isChecked =
    userSettings?.themeVariant &&
    userSettings?.themeVariant === THEME_VARIANTS.DARK;

  const handleChange = () => {
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.DARK
    ) {
      updateNotional({ themeVariant: THEME_VARIANTS.LIGHT });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.LIGHT,
      });
    }
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.LIGHT
    ) {
      updateNotional({ themeVariant: THEME_VARIANTS.DARK });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.DARK,
      });
    }
    if (!userSettings?.themeVariant) {
      updateNotional({ themeVariant: THEME_VARIANTS.DARK });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.DARK,
      });
    }
  };

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ToggleSwitch isChecked={isChecked} onToggle={() => handleChange()} />
    </Box>
  );
};

export default DarkModeToggle;
