import { makeStore } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';

export interface StakeState {
  noteAmount: TypedBigNumber | undefined;
  ethInputAmount: TypedBigNumber | undefined;
  noteHasError: boolean;
  ethHasError: boolean;
  ethOrWethSelected: string;
  useOptimumETH: boolean;
}

export const initialStakeState = {
  noteAmount: undefined,
  ethInputAmount: undefined,
  noteHasError: false,
  ethHasError: false,
  ethOrWethSelected: 'ETH',
  useOptimumETH: true,
};

const {
  _store: _stakeStore,
  updateState: updateStakeState,
  _state$: stakeState$,
  selectState: selectStakeState,
} = makeStore<StakeState>(initialStakeState);

export { updateStakeState, stakeState$, selectStakeState };
