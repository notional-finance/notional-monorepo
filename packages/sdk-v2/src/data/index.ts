import { BigNumber, Contract } from 'ethers';
import { AssetType, TypedBigNumber } from '..';
import { Replaced, DeepRequired, Primitive } from '../libs/UtilityTypes';
import { AssetRateAggregator, ERC20, NTokenERC20, IAggregator } from '@notional-finance/contracts';
import {
  Asset as _Asset,
  AssetRate as _AssetRate,
  CashGroup as _CashGroup,
  Currency as _Currency,
  ETHRate as _ETHRate,
  nToken as _nToken,
  SerializedBigNumber,
  SerializedContract,
  SerializedTypedBigNumber,
  sNOTE as _sNOTE,
  VaultConfig as _VaultConfig,
  VaultState as _VaultState,
  VaultHistoricalValue as _VaultHistoricalValue,
  TradingEstimate as _TradingEstimate,
} from './encoding/SystemProto';

type Rewrite<T> = Replaced<
  Replaced<
    Replaced<T, SerializedBigNumber, BigNumber, Primitive>,
    SerializedTypedBigNumber,
    TypedBigNumber,
    Primitive | BigNumber
  >,
  SerializedContract,
  Contract,
  Primitive | BigNumber | TypedBigNumber
>;

type RewriteRequired<T> = DeepRequired<Rewrite<T>, BigNumber | TypedBigNumber | Contract>;

export type StakedNoteParameters = RewriteRequired<_sNOTE>;
export type Currency = Omit<RewriteRequired<_Currency>, 'assetContract' | 'underlyingContract'> & {
  readonly assetContract: ERC20;
  readonly underlyingContract?: ERC20;
};
export type ETHRate = Omit<RewriteRequired<_ETHRate>, 'rateOracle'> & { readonly rateOracle: IAggregator };
export type AssetRate = Omit<RewriteRequired<_AssetRate>, 'rateAdapter'> & {
  readonly rateAdapter: AssetRateAggregator;
};
export type nToken = Omit<RewriteRequired<_nToken>, 'contract'> & { readonly contract: NTokenERC20 };
export type CashGroupData = RewriteRequired<_CashGroup>;
export type Asset = Omit<RewriteRequired<_Asset>, 'assetType'> & { readonly assetType: AssetType };
export type SecondaryBorrowArray = [TypedBigNumber?, TypedBigNumber?] | undefined;
export type VaultHistoricalValue = RewriteRequired<_VaultHistoricalValue>;
export type TradingEstimate = RewriteRequired<_TradingEstimate>;
export type VaultState = Omit<
  Rewrite<_VaultState>,
  | 'maturity'
  | 'isSettled'
  | 'totalPrimaryfCashBorrowed'
  | 'totalAssetCash'
  | 'totalVaultShares'
  | 'totalStrategyTokens'
  | 'historicalValue'
  | 'totalSecondaryfCashBorrowed'
  | 'totalSecondaryDebtShares'
  | 'settlementSecondaryBorrowfCashSnapshot'
> & {
  readonly maturity: number;
  readonly isSettled: boolean;
  readonly totalPrimaryfCashBorrowed: TypedBigNumber;
  readonly totalAssetCash: TypedBigNumber;
  readonly totalVaultShares: TypedBigNumber;
  readonly totalStrategyTokens: TypedBigNumber;
  readonly historicalValue: VaultHistoricalValue;
  readonly totalSecondaryfCashBorrowed?: SecondaryBorrowArray;
  readonly totalSecondaryDebtShares?: SecondaryBorrowArray;
  readonly settlementSecondaryBorrowfCashSnapshot?: SecondaryBorrowArray;
};

export type VaultConfig = Omit<
  RewriteRequired<_VaultConfig>,
  'secondaryBorrowCurrencies' | 'maxSecondaryBorrowCapacity' | 'totalUsedSecondaryBorrowCapacity' | 'vaultStates'
> & {
  readonly secondaryBorrowCurrencies?: number[];
  readonly maxSecondaryBorrowCapacity?: SecondaryBorrowArray;
  readonly totalUsedSecondaryBorrowCapacity?: SecondaryBorrowArray;
  readonly vaultStates?: VaultState[];
};

export interface SystemData {
  network: string;
  lastUpdateBlockNumber: number;
  lastUpdateTimestamp: number;
  USDExchangeRates: Map<string, BigNumber>;
  StakedNoteParameters: StakedNoteParameters;
  currencies: Map<number, Currency>;
  ethRateData: Map<number, ETHRate>;
  assetRateData: Map<number, AssetRate>;
  nTokenData: Map<number, nToken>;
  cashGroups: Map<number, CashGroupData>;
  vaults: Map<string, VaultConfig>;
  tradingEstimates: Map<string, TradingEstimate>;
}
