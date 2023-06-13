/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BigNumber,
  BigNumberish,
  ContractTransaction,
  PopulatedTransaction,
} from 'ethers';
import { TradeHistory, TypedBigNumber } from '@notional-finance/sdk';
import {
  NOTESummary,
  BalanceSummary,
  AssetSummary,
  Account,
} from '@notional-finance/sdk/src/account';
import { Market } from '@notional-finance/sdk/src/system';

export interface SetChainOptions {
  chainId: string | number;
  wallet: string;
}

export type OnboardOptions = {
  enableAccountCenter?: boolean;
  container?: string;
};

export interface EnableTokenProps {
  symbol: string;
  approved: boolean;
}

export interface BalanceSummaryResponse {
  balanceSummary: BalanceSummary[];
  NOTESummary: NOTESummary;
}

export interface ConnectedWallet {
  label: string;
  icon: string;
  account: string;
  chain: string;
}

export interface SupportedWallet {
  label: string;
  icon: string;
}

export interface BalanceSummaryResult {
  balanceSummary: BalanceSummary[];
  noteSummary: NOTESummary | null;
}

export interface AssetSummaryResult {
  assetSummary: AssetSummary[];
  tradeHistory: TradeHistory[];
}

export interface SummaryUpdateResult {
  balance: BalanceSummaryResult;
  asset: AssetSummaryResult;
  account: Account;
}

export interface ERC20 {
  balanceOf: (address: string) => Promise<BigNumber>;
  allowance: (address: string, spender: string) => Promise<BigNumber>;
  approve: (
    address: string,
    amount: BigNumberish
  ) => Promise<ContractTransaction>;
}

export interface AmountKey {
  key: string;
  value: string;
}
export interface ERC20Token {
  symbol: string;
  spender: string;
  contract?: ERC20;
}

export enum AllowanceStatus {
  APPROVED = 'APPROVED',
  UNAPPROVED = 'UNAPPROVED',
  PENDING = 'PENDING',
  SUCCCESS = 'SUCCCESS',
  ERROR = 'ERROR',
}
export interface TokenBalance {
  symbol: string;
  contract?: ERC20;
  spender: string;
  balance: TypedBigNumber;
  allowance: TypedBigNumber;
}

export interface CurrencyMarket {
  id: number;
  symbol: string;
  underlyingSymbol: string;
  markets: Map<string, Market>;
  orderedMarkets: Market[];
}

export interface MarketUpdate {
  [key: number]: CurrencyMarket;
}
export interface SelectedMarketValues {
  tradedRate: string;
  error: string | null;
  estimatedSlippage: string;
  interestAmount: number | null;
  fCashAmount: number | null;
}

export interface CalculateTradedRatesResult {
  tradedRates: string[];
  selectedMarketValues: SelectedMarketValues;
}

export interface MaturityData {
  fCashId: string;
  tradeRate: number | undefined;
  maturity: number;
  hasLiquidity: boolean;
  tradeRateString: string;
  rollMaturityRoute?: string;
  route?: string;
  fCashAmount?: TypedBigNumber;
  cashAmount?: TypedBigNumber;
}

export interface Hashable {
  hashKey: string;
}

export interface ID {
  id: string;
}

export interface NotionalError extends Error {
  msgId?: string;
  code?: number;
}

// @todo resolve this circular dependency by getting rid of notionable from shared-trade
export interface TransactionFunction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionFn: (...args: any) => Promise<PopulatedTransaction>;
  transactionArgs: unknown[];
}
