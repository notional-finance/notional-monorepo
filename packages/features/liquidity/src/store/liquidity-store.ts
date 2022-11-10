import { makeStore } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';

export interface LiquidityFeatureState {
  inputAmount: TypedBigNumber | undefined;
  hasError: boolean;
  selectedToken: string;
}

export const initialLiquidityState = {
  inputAmount: undefined,
  hasError: false,
  selectedToken: '',
};

const {
  _store: _liquidityStore,
  updateState: updateLiquidityState,
  _state$: liquidityState$,
  selectState: selectLiquidityState,
} = makeStore<LiquidityFeatureState>(initialLiquidityState);

export { updateLiquidityState, selectLiquidityState, liquidityState$ };
