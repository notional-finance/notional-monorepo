import { useCallback } from 'react';
import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import { useUserSettings } from '@notional-finance/notionable-hooks';
import { THEME_VARIANTS, getFromLocalStorage } from '@notional-finance/util';

export const useDarkModeToggle = () => {
  const userSettings = getFromLocalStorage('userSettings');
  const isChecked =
    userSettings?.themeVariant &&
    userSettings?.themeVariant === THEME_VARIANTS.DARK;

  const { updateThemeVariant } = useUserSettings();

  const toggleDarkMode = useCallback(() => {
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.DARK
    ) {
      updateThemeVariant(THEME_VARIANTS.LIGHT);
    }
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.LIGHT
    ) {
      updateThemeVariant(THEME_VARIANTS.DARK);
    }
    if (!userSettings?.themeVariant) {
      updateThemeVariant(THEME_VARIANTS.DARK);
    }
  }, [userSettings, updateThemeVariant]);

  return { toggleDarkMode, isChecked };
};

export const DarkModeToggle = () => {
  const { isChecked } = useDarkModeToggle();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <ToggleSwitch isChecked={isChecked} />
    </Box>
  );
};

export default DarkModeToggle;
