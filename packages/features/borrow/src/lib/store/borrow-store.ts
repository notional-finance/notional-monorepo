import { makeStore } from '@notional-finance/notionable';
import { CollateralAction, TypedBigNumber } from '@notional-finance/sdk';

export interface BorrowFeatureState {
  inputAmount: TypedBigNumber | undefined;
  fCashAmount: TypedBigNumber | undefined;
  selectedMarketKey: string | null;
  hasError: boolean;
  hasCollateralError: boolean;
  collateralAction: CollateralAction | undefined;
  collateralApy: number | undefined;
  collateralSymbol: string | undefined;
}

export const initialBorrowState = {
  inputAmount: undefined,
  hasError: false,
  fCashAmount: undefined,
  selectedMarketKey: null,
  hasCollateralError: false,
  collateralAction: undefined,
  collateralApy: undefined,
  collateralSymbol: undefined,
};

const {
  _store: _borrowStore,
  updateState: updateBorrowState,
  _state$: borrowState$,
  selectState: selectBorrowState,
} = makeStore<BorrowFeatureState>(initialBorrowState);

export { updateBorrowState, selectBorrowState, borrowState$ };
