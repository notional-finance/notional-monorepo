import { useCallback } from 'react';
import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { useAppState } from '@notional-finance/notionable-hooks';

export const useDarkModeToggle = () => {
  const { setThemeVariant } = useAppState();
  const userSettings = getFromLocalStorage('userSettings');
  const isChecked =
    userSettings?.themeVariant &&
    userSettings?.themeVariant === THEME_VARIANTS.DARK;

  const toggleDarkMode = useCallback(() => {
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.DARK
    ) {
      setThemeVariant(THEME_VARIANTS.LIGHT);
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.LIGHT,
      });
    }
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.LIGHT
    ) {
      setThemeVariant(THEME_VARIANTS.DARK);
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.DARK,
      });
    }
    if (!userSettings?.themeVariant) {
      setThemeVariant(THEME_VARIANTS.DARK);
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.DARK,
      });
    }
  }, [setThemeVariant, userSettings]);

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
