import { PaletteMode } from '@mui/material';
import { useObservableState } from 'observable-hooks';
import { themeVariant$, language$ } from './user-settings-store';

export function useUserSettingsState() {
  const themeVariant = useObservableState(themeVariant$) as PaletteMode;
  const language = useObservableState(language$) as null | string;

  return {
    themeVariant,
    language
  };
}
