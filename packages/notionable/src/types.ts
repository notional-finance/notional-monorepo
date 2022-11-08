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
  marketKey: string;
  tradeRate: number | undefined;
  maturity: number;
  hasLiquidity: boolean;
  tradeRateString: string;
  rollMaturityRoute?: string;
  fCashAmount?: TypedBigNumber;
  cashAmount?: TypedBigNumber;
}

export interface TransactionFunction {
  transactionFn: (...args: any) => Promise<PopulatedTransaction>;
  transactionArgs: any[];
}

export interface TransactionData {
  transactionHeader: string;
  transactionProperties: TradeProperties;
  buildTransactionCall: TransactionFunction;
}

export interface Hashable {
  hashKey: string;
}
export interface NotionalError extends Error {
  msgId?: string;
  code?: number;
}

export enum TradePropertyKeys {
  deposit = 'transactionProperties.deposit',
  fromCashBalance = 'transactionProperties.fromCashBalance',
  fromWalletBalance = 'transactionProperties.fromWalletBalance',
  interestEarned = 'transactionProperties.interestEarned',
  apy = 'transactionProperties.apy',
  fCashMinted = 'transactionProperties.fCashMinted',
  maturity = 'transactionProperties.maturity',
  amountToWallet = 'transactionProperties.amountToWallet',
  amountToPortfolio = 'transactionProperties.amountToPortfolio',
  interestDue = 'transactionProperties.interestDue',
  collateralRatio = 'transactionProperties.collateralRatio',
  loanToValue = 'transactionProperties.loanToValue',
  collateralDeposit = 'transactionProperties.collateralDeposit',
  collateralType = 'transactionProperties.collateralType',
  collateralAPY = 'transactionProperties.collateralAPY',
  incentivesMinted = 'transactionProperties.incentivesMinted',
  nTokensMinted = 'transactionProperties.nTokensMinted',
  nTokensRedeemed = 'transactionProperties.nTokensRedeemed',
  nTokenShare = 'transactionProperties.nTokenShare',
  newMaturity = 'transactionProperties.newMaturity',
  newfCashAmount = 'transactionProperties.newfCashAmount',
  costToRepay = 'transactionProperties.costToRepay',
  repaymentRate = 'transactionProperties.repaymentRate',
  withdrawLendRate = 'transactionProperties.withdrawLendRate',
  leverageRatio = 'transactionProperties.leverageRatio',
  transactionCosts = 'transactionProperties.transactionCosts',
  assetsSold = 'transactionProperties.assetsSold',
  debtRepaid = 'transactionProperties.debtRepaid',
  nTokenRedeemSlippage = 'transactionProperties.nTokenRedeemSlippage',
  noteDeposit = 'transactionProperties.noteDeposit',
  ethDeposit = 'transactionProperties.ethDeposit',
  notePrice = 'transactionProperties.notePrice',
  ethReceived = 'transactionProperties.ethReceived',
  noteReceived = 'transactionProperties.noteReceived',
  sNOTERedeemed = 'transactionProperties.sNOTERedeemed',
  redeemWindowBegins = 'transactionProperties.redeemWindowBegins',
  redeemWindowEnds = 'transactionProperties.redeemWindowEnds',
  additionalDebt = 'transactionProperties.additionalDebt',
  remainingDebt = 'transactionProperties.remainingDebt',
  remainingAssets = 'transactionProperties.remainingAssets',
}

export type TradeProperties = Partial<{
  [TradePropertyKeys.maturity]: number;
  [TradePropertyKeys.newMaturity]: number;
  [TradePropertyKeys.apy]: number;
  [TradePropertyKeys.collateralRatio]: number;
  [TradePropertyKeys.loanToValue]: number;
  [TradePropertyKeys.repaymentRate]: number;
  [TradePropertyKeys.withdrawLendRate]: number;
  [TradePropertyKeys.leverageRatio]: number;
  [TradePropertyKeys.collateralAPY]: number;
  [TradePropertyKeys.collateralType]: string;
  [TradePropertyKeys.nTokenShare]: number;
  [TradePropertyKeys.notePrice]: number;
  [TradePropertyKeys.deposit]: TypedBigNumber;
  [TradePropertyKeys.fromCashBalance]: TypedBigNumber;
  [TradePropertyKeys.fromWalletBalance]: TypedBigNumber;
  [TradePropertyKeys.interestEarned]: TypedBigNumber;
  [TradePropertyKeys.fCashMinted]: TypedBigNumber;
  [TradePropertyKeys.amountToWallet]: TypedBigNumber;
  [TradePropertyKeys.amountToPortfolio]: TypedBigNumber;
  [TradePropertyKeys.interestDue]: TypedBigNumber;
  [TradePropertyKeys.collateralDeposit]: TypedBigNumber;
  [TradePropertyKeys.incentivesMinted]: TypedBigNumber;
  [TradePropertyKeys.nTokensMinted]: TypedBigNumber;
  [TradePropertyKeys.nTokensRedeemed]: TypedBigNumber;
  [TradePropertyKeys.newfCashAmount]: TypedBigNumber;
  [TradePropertyKeys.costToRepay]: TypedBigNumber;
  [TradePropertyKeys.assetsSold]: TypedBigNumber;
  [TradePropertyKeys.debtRepaid]: TypedBigNumber;
  [TradePropertyKeys.transactionCosts]: TypedBigNumber;
  [TradePropertyKeys.nTokenRedeemSlippage]: TypedBigNumber;
  [TradePropertyKeys.noteDeposit]: TypedBigNumber;
  [TradePropertyKeys.ethDeposit]: TypedBigNumber;
  [TradePropertyKeys.ethReceived]: TypedBigNumber;
  [TradePropertyKeys.noteReceived]: TypedBigNumber;
  [TradePropertyKeys.sNOTERedeemed]: TypedBigNumber;
  [TradePropertyKeys.redeemWindowBegins]: string;
  [TradePropertyKeys.redeemWindowEnds]: string;
  [TradePropertyKeys.additionalDebt]: TypedBigNumber;
  [TradePropertyKeys.remainingDebt]: TypedBigNumber;
  [TradePropertyKeys.remainingAssets]: TypedBigNumber;
}>;
