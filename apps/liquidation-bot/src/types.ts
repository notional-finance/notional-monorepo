import { BigNumber } from 'ethers';
import Liquidation from './liquidation';

export interface IGasOracle {
  getGasPrice(): Promise<BigNumber>;
}

export interface IFlashLoanProvider {
  estimateGas(liq: FlashLiquidation): Promise<BigNumber>;
  encodeTransaction(liq: FlashLiquidation): Promise<string>;
}

export class MetricNames {
  public static readonly NUM_RISKY_ACCOUNTS =
    'liquidator_bot.num_risky_accounts';
}

export enum LiquidationType {
  LOCAL_CURRENCY,
  COLLATERAL_CURRENCY,
  LOCAL_FCASH,
  CROSS_CURRENCY_FCASH,
  LOCAL_IFCASH,
  CROSS_CURRENCY_IFCASH,
}

export enum DexId {
  UNKNOWN,
  UNISWAP_V2,
  UNISWAP_V3,
  ZERO_EX,
  BALANCER_V2,
  CURVE,
  NOTIONAL_VAULT,
}

export enum TradeType {
  EXACT_IN_SINGLE,
  EXACT_OUT_SINGLE,
  EXACT_IN_BATCH,
  EXACT_OUT_BATCH,
}

export type Trade = {
  tradeType: TradeType;
  sellToken: string;
  buyToken: string;
  amount: BigNumber;
  limit: BigNumber;
  deadline: BigNumber;
  exchangeData: string;
};

export type TradeData = {
  trade: Trade;
  dexId: number;
  useDynamicSlippage: boolean;
  dynamicSlippageLimit: BigNumber;
};

export type CurrencyOverride = {
  id: number;
  flashBorrowAsset: string;
};

export type Account = {
  id: string;
  ethFreeCollateral: BigNumber;
};

export type RiskyAccount = {
  id: string;
  ethFreeCollateral: BigNumber;
  data: RiskyAccountData;
  netUnderlyingAvailable: Map<number, BigNumber>;
};

export type AccountBalance = {
  currencyId: number;
  cashBalance: BigNumber;
  nTokenBalance: BigNumber;
};

export type Asset = {
  currencyId: number;
  maturity: number;
  notional: BigNumber;
};

export type RiskyAccountData = {
  balances: AccountBalance[];
  portfolio: Asset[];
};

export type LiquidationProfit = {
  localProfit: BigNumber;
  collateralProfit: BigNumber;
};

export type AccountLiquidation = {
  accountId: string;
  liquidation: Liquidation;
  flashLoanAmount: BigNumber;
};

export type FlashLiquidation = {
  accountLiq: AccountLiquidation;
  flashBorrowAsset: string;
  preLiquidationTrade: TradeData | null;
  collateralTrade: TradeData | null;
};
