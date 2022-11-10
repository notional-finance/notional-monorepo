import { LEND_BORROW } from '@notional-finance/utils'
import { makeStore } from '@notional-finance/notionable'
import { TypedBigNumber } from '@notional-finance/sdk'

export interface LandingFeatureState {
  inputAmount: TypedBigNumber | undefined
  fCashAmount: TypedBigNumber | undefined
  selectedMarketKey: string | null
  selectedToken: string
  hasError: boolean
  lendOrBorrow: LEND_BORROW
}

export const initialLandingState = {
  inputAmount: undefined,
  hasError: false,
  selectedToken: 'USDC',
  fCashAmount: undefined,
  selectedMarketKey: null,
  lendOrBorrow: LEND_BORROW.BORROW
}

const {
  updateState: updateLandingState,
  _state$: landingState$,
  selectState: selectLandingState
} = makeStore<LandingFeatureState>(initialLandingState)

export { updateLandingState, selectLandingState, landingState$ }
