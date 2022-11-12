import { makeStore } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';

export interface LendFeatureState {
  inputAmount: TypedBigNumber | undefined;
  fCashAmount: TypedBigNumber | undefined;
  selectedMarketKey: string | null;
  hasError: boolean;
  selectedToken: string;
  fillDefaultCashBalance: boolean;
}

export const initialLendState = {
  inputAmount: undefined,
  hasError: false,
  selectedToken: '',
  fCashAmount: undefined,
  selectedMarketKey: null,
  fillDefaultCashBalance: true,
};

const {
  _store: _lendStore,
  updateState: updateLendState,
  _state$: lendState$,
  selectState: selectLendState,
} = makeStore<LendFeatureState>(initialLendState);

export { updateLendState, selectLendState, lendState$ };

selectLendState('selectedToken').subscribe(() => {
  // Fill the default cash balance any time the token changes
  updateLendState({ fillDefaultCashBalance: true });
});

selectLendState('inputAmount').subscribe(() => {
  // Don't fill it once the user interacts with the input amount
  updateLendState({ fillDefaultCashBalance: false });
});
