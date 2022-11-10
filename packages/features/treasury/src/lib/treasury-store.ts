import { makeStore } from '@notional-finance/notionable';
import { BigNumber } from 'ethers';

export interface TreasuryState {
  selectedReserveCurrency: string;
  inputTradeReserve: string;
  inputTradeWETH: string;
  cancelOrderId: string;
  inputInvestNOTE: string;
  inputInvestETH: string;
  tradeReserveStatus: string;
  tradePriceFloor?: BigNumber;
  tradeSpotPrice?: BigNumber;
}

export const initialTreasuryState = {
  selectedReserveCurrency: 'COMP',
  inputTradeReserve: '',
  inputTradeWETH: '',
  cancelOrderId: '',
  inputInvestNOTE: '',
  inputInvestETH: '',
  tradeReserveStatus: '',
  tradePriceFloor: undefined,
  tradeSpotPrice: undefined,
};

const {
  _store: _stakeStore,
  updateState: updateTreasuryState,
  _state$: treasuryState$,
  selectState: selectTreasuryState,
} = makeStore<TreasuryState>(initialTreasuryState);

export { updateTreasuryState, treasuryState$, selectTreasuryState };
