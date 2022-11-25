import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import {
  updateUserSettingsState,
  useUserSettingsState,
} from '@notional-finance/shared-web';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';

export const DarkModeToggle = () => {
  const { themeVariant } = useUserSettingsState();
  const userSettings = getFromLocalStorage('userSettings');
  const isChecked = themeVariant === THEME_VARIANTS.DARK;

  const handleChange = () => {
    if (themeVariant === THEME_VARIANTS.DARK) {
      updateUserSettingsState({ themeVariant: THEME_VARIANTS.LIGHT });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.LIGHT,
      });
    }
    if (themeVariant === THEME_VARIANTS.LIGHT) {
      updateUserSettingsState({ themeVariant: THEME_VARIANTS.DARK });
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
