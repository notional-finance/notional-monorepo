import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { TransactionFunction } from '../types';

interface UserInputs {
  // This is set on load via a URL parameter
  currency?: string;
  inputAmount?: string;
  hasError: boolean;
  nTokenSymbol?: string;
  nToken?: TokenDefinition;
  underlying?: TokenDefinition;
}

interface SelectedData {
  blendedYield?: number;
  totalYield?: number;
  incentiveYield?: number;
}

interface TransactionState {
  canSubmit: boolean;
  confirm: boolean;
  nTokensMinted?: TokenBalance;
  buildTransactionCall?: TransactionFunction;
}

export interface LiquidityState
  extends Record<string, unknown>,
    UserInputs,
    SelectedData,
    TransactionState {
  isReady: boolean;
  availableTokens?: string[];
  availableDepositTokens?: TokenDefinition[];
  availableNTokens?: TokenDefinition[];
}

export const initialLiquidityState = {
  isReady: false,
  hasError: false,
  canSubmit: false,
  confirm: false,
};
