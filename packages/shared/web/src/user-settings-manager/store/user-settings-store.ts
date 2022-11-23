import { PaletteMode } from '@mui/material';
import {
  getFromLocalStorage,
  setInLocalStorage,
} from '@notional-finance/helpers';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { makeStore } from '@notional-finance/notionable';
import { Observable } from 'rxjs';

const userSettings = getFromLocalStorage('userSettings');

const initTheme = () => {
  if (!userSettings?.themeVariant) {
    setInLocalStorage('userSettings', { ...userSettings, themeVariant: THEME_VARIANTS.LIGHT });
  }
};
initTheme();

const defaultTheme =
!userSettings?.themeVariant ? THEME_VARIANTS.LIGHT : userSettings.themeVariant;

export interface UserSettingsState {
  themeVariant: PaletteMode;
}

export const initialUserSettingsState = {
  themeVariant: defaultTheme,
};

const {
  updateState: updateUserSettingsState,
  _state$: userSettingsState$,
  selectState: selectUserSettingsState,
} = makeStore<UserSettingsState>(initialUserSettingsState);

export const themeVariant$ = selectUserSettingsState(
  'themeVariant'
) as Observable<PaletteMode>;

export { updateUserSettingsState, selectUserSettingsState, userSettingsState$ };
