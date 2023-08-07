import {
  BaseTradeState,
  TradeState,
  VaultTradeState,
} from '@notional-finance/notionable';
import { ObservableContext } from './context/ObservableContext';

export * from './context/use-trade-context';
export * from './context/use-vault-context';
export * from './context/NotionalContext';
export * from './use-account';
export * from './use-user-settings';
export * from './use-transaction';
export * from './use-notional';
export * from './use-market';
export * from './use-wallet';
export * from './use-vault';
export * from './use-query-params';
export * from './use-summary';

export type BaseTradeContext = ObservableContext<BaseTradeState>;
export type TradeContext = ObservableContext<TradeState>;
export type VaultContext = ObservableContext<VaultTradeState>;
