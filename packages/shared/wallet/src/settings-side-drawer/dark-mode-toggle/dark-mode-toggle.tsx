import { Box } from '@mui/material';
import { ToggleSwitch } from '@notional-finance/mui';
import { useGlobalContext } from '@notional-finance/notionable-hooks';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  setInLocalStorage,
  getFromLocalStorage,
} from '@notional-finance/helpers';

export const DarkModeToggle = () => {
  const globalState = useGlobalContext();
  const { updateState } = globalState;
  const userSettings = getFromLocalStorage('userSettings');
  const isChecked =
    userSettings?.themeVariant &&
    userSettings?.themeVariant === THEME_VARIANTS.DARK;

  const handleChange = () => {
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.DARK
    ) {
      updateState({ themeVariant: THEME_VARIANTS.LIGHT });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.LIGHT,
      });
      window.location.reload();
    }
    if (
      userSettings?.themeVariant &&
      userSettings?.themeVariant === THEME_VARIANTS.LIGHT
    ) {
      updateState({ themeVariant: THEME_VARIANTS.DARK });
      setInLocalStorage('userSettings', {
        ...userSettings,
        themeVariant: THEME_VARIANTS.DARK,
      });
      window.location.reload();
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
