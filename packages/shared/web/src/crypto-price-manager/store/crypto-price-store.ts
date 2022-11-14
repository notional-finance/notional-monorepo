import { makeStore } from '@notional-finance/notionable';
import { Observable } from 'rxjs';

export interface CryptoPriceState {
  cryptoPrices: {
    [symbol: string]: {
      '7D': number;
      '24H': number;
      price: number;
    };
  };
}

export const initialCryptoPriceState = {
  cryptoPrices: {},
};

const {
  updateState: updateCryptoPriceState,
  _state$: cryptoPriceState$,
  selectState: selectCryptoPriceState,
} = makeStore<CryptoPriceState>(initialCryptoPriceState);

export const cryptoPrices$ = selectCryptoPriceState('cryptoPrices') as Observable<Record<any, any>>;

export { updateCryptoPriceState, selectCryptoPriceState, cryptoPriceState$ };
