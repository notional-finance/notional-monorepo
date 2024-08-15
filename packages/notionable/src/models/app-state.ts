import { types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { getFromLocalStorage, THEME_VARIANTS } from '@notional-finance/util';
import { useObserver } from 'mobx-react-lite';

const userSettings = getFromLocalStorage('userSettings');

const AppState = types
    .model('AppState', {
        baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
        themeVariant: types.enumeration('ThemeVariant', Object.values(THEME_VARIANTS)),
    })
    .actions((self) => ({
        setBaseCurrency(currency: FiatKeys) {
            self.baseCurrency = currency;
        },
        setThemeVariant(variant: THEME_VARIANTS) {
            self.themeVariant = variant;
        },

    }));

    const AppStore = AppState.create({
        baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
        themeVariant: userSettings?.themeVariant
        ? userSettings?.themeVariant
        : THEME_VARIANTS.LIGHT,
    });

    export const useAppState = () => {
        return useObserver(() => {
            return {
                setBaseCurrency: (currency: FiatKeys) => AppStore.setBaseCurrency(currency),
                setThemeVariant: (variant: THEME_VARIANTS) => AppStore.setThemeVariant(variant),
                baseCurrency: AppStore.baseCurrency,
                themeVariant: AppStore.themeVariant,
            }
        });
    }


export default useAppState;