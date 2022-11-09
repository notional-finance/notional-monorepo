import { PaletteMode } from '@mui/material';
import { getFromLocalStorage, setInLocalStorage, THEME_VARIANTS } from '@notional-finance/utils';
import { makeStore } from '@notional-finance/notionable';
import { Observable } from 'rxjs';

const savedTheme = getFromLocalStorage('themeVariant');

const initTheme = () => {
  if (JSON.stringify(savedTheme) === '{}') {
    setInLocalStorage('themeVariant', THEME_VARIANTS.LIGHT);
  }
};
initTheme();

const defaultTheme = JSON.stringify(savedTheme) === '{}' ? THEME_VARIANTS.LIGHT : savedTheme;

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

export const themeVariant$ = selectUserSettingsState('themeVariant') as Observable<PaletteMode>;

export { updateUserSettingsState, selectUserSettingsState, userSettingsState$ };
