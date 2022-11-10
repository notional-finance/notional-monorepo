import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import { updateUserSettingsState, useUserSettingsState } from '@notional-finance/notional-web';
import { THEME_VARIANTS } from '@notional-finance/utils';
import { setInLocalStorage } from '@notional-finance/utils';

export const DarkModeToggle = () => {
  const { themeVariant } = useUserSettingsState();
  const isChecked = themeVariant === THEME_VARIANTS.DARK;

  const handleChange = () => {
    if (themeVariant === THEME_VARIANTS.DARK) {
      updateUserSettingsState({ themeVariant: THEME_VARIANTS.LIGHT });
      setInLocalStorage('themeVariant', THEME_VARIANTS.LIGHT);
    }
    if (themeVariant === THEME_VARIANTS.LIGHT) {
      updateUserSettingsState({ themeVariant: THEME_VARIANTS.DARK });
      setInLocalStorage('themeVariant', THEME_VARIANTS.DARK);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ToggleSwitch isChecked={isChecked} onToggle={() => handleChange()} />
    </Box>
  );
};

export default DarkModeToggle;
