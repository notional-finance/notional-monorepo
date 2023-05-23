import { TokenDefinition } from '@notional-finance/core-entities';
import { createObservableContext } from '@notional-finance/notionable-hooks';
import { TradeProperties, TransactionData } from '@notional-finance/trade';

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
  tradeProperties?: TradeProperties;
  canSubmit: boolean;
  confirm: boolean;
  txnData?: TransactionData;
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

export const LiquidityContext = createObservableContext<LiquidityState>(
  'liquidity-context',
  initialLiquidityState
);
