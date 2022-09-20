import { BigNumber, BigNumberish, BytesLike } from 'ethers';
import TypedBigNumber from './TypedBigNumber';
import {
  BalancerPool,
  BalancerVault,
  ERC20,
  Governor,
  NoteERC20,
  SNOTE,
  TreasuryManager,
  Notional as NotionalProxyTypechain,
  ExchangeV3,
} from '@notional-finance/contracts';

export enum NTokenStatus {
  NoNToken = 'NoNToken',
  Ok = 'Ok',
  MarketsNotInitialized = 'MarketsNotInitialized',
  nTokenHasResidual = 'nTokenHasResidual',
}

export enum TokenType {
  UnderlyingToken = 'UnderlyingToken',
  cToken = 'cToken',
  cETH = 'cETH',
  Ether = 'Ether',
  NonMintable = 'NonMintable',
}

export enum ProposalStateEnum {
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  QUEUED = 'QUEUED',
  EXECUTED = 'EXECUTED',
}

export enum TradeType {
  Lend = 'Lend',
  Borrow = 'Borrow',
  AddLiquidity = 'AddLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  PurchaseNTokenResidual = 'PurchaseNTokenResidual',
  SettleCashDebt = 'SettleCashDebt',
  Transfer = 'Transfer',
}

export enum AssetType {
  fCash = 'fCash',
  LiquidityToken_3Month = 'LiquidityToken_3Month',
  LiquidityToken_6Month = 'LiquidityToken_6Month',
  LiquidityToken_1Year = 'LiquidityToken_1Year',
  LiquidityToken_2Year = 'LiquidityToken_2Year',
  LiquidityToken_5Year = 'LiquidityToken_5Year',
  LiquidityToken_10Year = 'LiquidityToken_10Year',
  LiquidityToken_20Year = 'LiquidityToken_20Year',
}

export interface WalletBalance {
  lastUpdateBlockNumber: number;
  lastUpdateTime: Date;
  currencyId: number;
  symbol: string;
  isUnderlying: boolean;
  balance: TypedBigNumber;
  allowance: TypedBigNumber;
  spender: string;
}

// This is a cut down version of the interface returned from typechain
export interface Balance {
  currencyId: number;
  cashBalance: TypedBigNumber;
  nTokenBalance: TypedBigNumber | undefined;
  lastClaimTime: BigNumber;
  accountIncentiveDebt: BigNumber;
}

export enum TradeActionType {
  Lend,
  Borrow,
  AddLiquidity,
  RemoveLiquidity,
  PurchaseNTokenResidual,
  SettleCashDebt,
}

export enum DepositActionType {
  None,
  DepositAsset,
  DepositUnderlying,
  DepositAssetAndMintNToken,
  DepositUnderlyingAndMintNToken,
  RedeemNToken,
  ConvertCashToNToken,
}

export interface BatchBalanceAction {
  actionType: DepositActionType;
  currencyId: BigNumberish;
  depositActionAmount: BigNumberish;
  withdrawAmountInternalPrecision: BigNumberish;
  withdrawEntireCashBalance: boolean;
  redeemToUnderlying: boolean;
}

export interface BatchBalanceAndTradeAction {
  actionType: DepositActionType;
  currencyId: BigNumberish;
  depositActionAmount: BigNumberish;
  withdrawAmountInternalPrecision: BigNumberish;
  withdrawEntireCashBalance: boolean;
  redeemToUnderlying: boolean;
  trades: BytesLike[];
}

export interface TradeHistory {
  id: string;
  blockNumber: number;
  transactionHash: string;
  blockTime: Date;
  currencyId: number;
  tradeType: TradeType;
  settlementDate: BigNumber | null;
  maturityLength: number | null;
  maturity: BigNumber;
  netAssetCash: TypedBigNumber;
  netUnderlyingCash: TypedBigNumber;
  netfCash: TypedBigNumber;
  netLiquidityTokens: TypedBigNumber | null;
  tradedInterestRate: number;
}

export interface BalanceHistory {
  id: string;
  blockNumber: number;
  blockTime: Date;
  transactionHash: string;

  currencyId: number;
  tradeType: string;
  assetCashBalanceBefore: TypedBigNumber;
  assetCashBalanceAfter: TypedBigNumber;
  assetCashValueUnderlyingBefore: TypedBigNumber;
  assetCashValueUnderlyingAfter: TypedBigNumber;

  nTokenBalanceBefore?: TypedBigNumber;
  nTokenBalanceAfter?: TypedBigNumber;
  nTokenValueUnderlyingBefore?: TypedBigNumber;
  nTokenValueUnderlyingAfter?: TypedBigNumber;
  nTokenValueAssetBefore?: TypedBigNumber;
  nTokenValueAssetAfter?: TypedBigNumber;
  totalUnderlyingValueChange: TypedBigNumber;
}

export interface StakedNoteHistory {
  ethAmountJoined: TypedBigNumber;
  noteAmountJoined: TypedBigNumber;
  ethAmountRedeemed: TypedBigNumber;
  noteAmountRedeemed: TypedBigNumber;

  transactions: {
    blockNumber: number;
    transactionHash: string;
    blockTime: Date;
    sNOTEAmountBefore: TypedBigNumber;
    sNOTEAmountAfter: TypedBigNumber;
    ethAmountChange: TypedBigNumber;
    noteAmountChange: TypedBigNumber;
  }[];
}

export type AccountHistory = {
  trades: TradeHistory[];
  balanceHistory: BalanceHistory[];
  sNOTEHistory: StakedNoteHistory;
};

export interface IncentiveFactors {
  accumulatedNOTEPerNToken: BigNumber;
  lastAccumulatedTime: BigNumber;
}

export interface IncentiveMigration {
  migratedEmissionRate: BigNumber;
  integralTotalSupply: BigNumber;
  migrationTime: number;
}

export interface SettlementMarket {
  settlementDate: number;
  totalfCash: TypedBigNumber;
  totalAssetCash: TypedBigNumber;
  totalLiquidity: TypedBigNumber;
}

export interface Contracts {
  notionalProxy: NotionalProxyTypechain;
  sNOTE: SNOTE;
  note: NoteERC20;
  governor: Governor;
  treasury: TreasuryManager;
  balancerVault: BalancerVault;
  balancerPool: BalancerPool;
  exchangeV3: ExchangeV3 | null;
  weth: ERC20;
  comp: ERC20 | null;
}

export interface ReturnsBreakdown {
  source: string;
  balance: TypedBigNumber;
  value: TypedBigNumber;
  interestEarned?: TypedBigNumber;
  realizedYield?: number;
  rateOfChangePerSecond?: number;
}

export interface TransactionHistory {
  currencyId: number;
  txnType: string;
  timestampMS: number;
  transactionHash: string;
  amount: TypedBigNumber;
  maturity?: number;
  rate?: number;
}

export interface ReserveData {
  symbol: string;
  reserveBalance: TypedBigNumber;
  reserveBuffer: TypedBigNumber;
  treasuryBalance: TypedBigNumber;
}

export enum CollateralActionType {
  ASSET_CASH,
  NTOKEN,
  LEND_FCASH,
}

export interface CollateralAction {
  type: CollateralActionType;
  marketKey?: string;
  amount?: TypedBigNumber;
  fCashAmount?: TypedBigNumber;
  minLendSlippage?: number;
}
