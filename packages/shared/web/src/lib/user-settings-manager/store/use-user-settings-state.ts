import { PaletteMode } from '@mui/material';
import { useObservableState } from 'observable-hooks';
import { themeVariant$ } from './user-settings-store';

export function useUserSettingsState() {
  const themeVariant = useObservableState(themeVariant$) as PaletteMode;

  return {
    themeVariant,
  };
}
