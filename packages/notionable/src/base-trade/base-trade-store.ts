import {
  AccountDefinition,
  ConfigurationClient,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { RiskFactorKeys, RiskFactorLimit } from '@notional-finance/risk-engine';
import {
  CalculationFn,
  CalculationFnParams,
  TransactionBuilder,
} from '@notional-finance/transaction';
import { PopulatedTransaction } from 'ethers';
import { VaultTradeConfiguration, VaultTradeType } from './vault-trade-config';
import { TradeType } from './trade-config';
import { AccountRiskSummary, VaultAccountRiskSummary } from './sagas';
import { Network } from '@notional-finance/util';
export { TradeConfiguration } from './trade-config';
export { VaultTradeConfiguration } from './vault-trade-config';
import { NOTETradeType } from './note-manager';
export type { TradeType } from './trade-config';
export type { VaultTradeType } from './vault-trade-config';
export type { NOTETradeType } from './note-manager';

export type AllTradeTypes = TradeType | VaultTradeType | NOTETradeType;

export type FilterFunc = (
  t: TokenDefinition,
  a: AccountDefinition | null,
  s: VaultTradeState | TradeState,
  l: TokenDefinition[]
) => boolean;

export interface TransactionConfig {
  readonly calculationFn: CalculationFn;
  readonly requiredArgs: CalculationFnParams[];
  readonly depositFilter?: FilterFunc;
  readonly collateralFilter?: FilterFunc;
  readonly debtFilter?: FilterFunc;
  readonly calculateDebtOptions?: boolean;
  readonly calculateCollateralOptions?: boolean;
  readonly transactionBuilder: TransactionBuilder;
}

interface VaultState {
  vaultAddress?: string;
  vaultConfig?: ReturnType<ConfigurationClient['getVaultConfig']>;
  /** True if the vault amount is under the minimum borrow size */
  vaultCapacityError?: boolean;
  underMinAccountBorrow?: boolean;
  minBorrowSize?: string;
  overCapacityError?: boolean;
  overPoolCapacityError?: boolean;
  totalPoolCapacityRemaining?: TokenBalance;
  totalCapacityRemaining?: TokenBalance;
  vaultTVL?: TokenBalance;
}

export interface TokenOption {
  token: TokenDefinition;
  balance?: TokenBalance;
  interestRate?: number;
  error?: string;
  utilization?: number;
}

/** Inputs set by the user interface, all of these are denominated in primitive values */
interface UserInputs {
  /** Symbol of the selected deposit token, if any */
  selectedDepositToken?: string;
  /**
   * Symbol of the selected token on portfolio transaction screens such as withdraw,
   * repay debt, and roll maturity
   */
  selectedToken?: string;
  /** NOTE: this is currently unused throughout the site */
  redeemToWETH: boolean;
  /** Signals that the input is a max withdraw or max repayment */
  maxWithdraw: boolean;
  /** True if there are any input validation errors */
  inputErrors: boolean;

  /** Selected network for the current trade, the user can change this */
  selectedNetwork?: Network;

  /** Used as a flag to reset the state on path changes */
  reset?: boolean;

  /** The current URL path for tracking URL route updates */
  pathname?: string;
}

/** Calculated values based on token inputs */
interface TokenInputs {
  /** Collateral token definition */
  collateral?: TokenDefinition;
  /** Debt token definition */
  debt?: TokenDefinition;
  /** Deposit token definition, always in underlying */
  deposit?: TokenDefinition;

  /** Parsed from selected risk factors */
  riskFactorLimit?: RiskFactorLimit<RiskFactorKeys>;
  /** Calculated deposit balance, always in underlying */
  depositBalance?: TokenBalance;
  /** A secondary deposit balance, used for NOTE balances in staking */
  secondaryDepositBalance?: TokenBalance;
  /** Calculated deposit balance, always in `collateral` token denomination */
  collateralBalance?: TokenBalance;
  /** Calculated deposit balance, always in `debt` token denomination */
  debtBalance?: TokenBalance;
  /** Calculated fee for creating collateral balance, always in prime cash token denomination */
  collateralFee?: TokenBalance;
  /** Calculated fee for creating debt balance, always in prime cash token denomination */
  debtFee?: TokenBalance;
  /** Error message from calculation */
  calculateError?: string;
  /** Alternative debt options given if all the inputs are satisfied */
  debtOptions?: TokenOption[];
  /** Alternative collateral options given if all the inputs are satisfied */
  collateralOptions?: TokenOption[];

  /** Default leverage ratio for the selected debt and collateral */
  defaultLeverageRatio?: number;
  /** Minimum allowed leverage ratio (only applies to vaults) */
  minLeverageRatio?: number;
  /** Maximum allowed leverage ratio */
  maxLeverageRatio?: number;
}

interface TransactionState {
  /** True if all the required inputs are satisfied */
  inputsSatisfied: boolean;
  /** True if all calculations have been completed */
  calculationSuccess: boolean;
  /** True if the calculations are successful and the risk check has completed */
  canSubmit: boolean;
  /** Contains a unique key for each set of calculation inputs */
  calculateInputKeys?: string;
  /** True if the form is in the confirmation state */
  confirm: boolean;
  /** Transaction call information for the confirmation page */
  populatedTransaction?: PopulatedTransaction;
  /** Error creating transaction */
  transactionError?: string;
  /** Simulation error transaction */
  simulationError?: string;

  /** Net amount of assets, when rolling refers to the new asset */
  netAssetBalance?: TokenBalance;
  /** Net amount of debts, when rolling refers to the new debt  */
  netDebtBalance?: TokenBalance;
  /** Net cost of assets in underlying terms */
  netRealizedCollateralBalance?: TokenBalance;
  /** Net cost of debts in underlying terms*/
  netRealizedDebtBalance?: TokenBalance;

  /** Calculated updates to the account balances post trade */
  postTradeBalances?: TokenBalance[];
  /** Calculated incentives to the account balances post trade */
  postTradeIncentives?: TokenBalance[];
}

interface InitState {
  /** True if the page is ready to be displayed */
  isReady: boolean;
  /** A list of tokens that can be deposited */
  availableDepositTokens?: TokenDefinition[];
  /** A list of collateral tokens that can be selected */
  availableCollateralTokens?: TokenDefinition[];
  /** A list of debt tokens that can be selected */
  availableDebtTokens?: TokenDefinition[];
  /** A key into the trade configuration object */
  tradeType?: AllTradeTypes;
  /** A parameter key set by the url params */
  sideDrawerKey?: string;
  /** Maximum collateral slippage for the vault */
  maxCollateralSlippage?: number | null;
}

export interface BaseTradeState
  extends Record<string, unknown>,
    InitState,
    UserInputs,
    TokenInputs,
    TransactionState,
    VaultState {}

export interface TradeState
  extends BaseTradeState,
    Partial<Omit<AccountRiskSummary, 'postTradeBalances'>> {}

export interface VaultTradeState
  extends BaseTradeState,
    Partial<Omit<VaultAccountRiskSummary, 'postTradeBalances'>> {}

export interface NOTETradeState extends BaseTradeState {
  useOptimalETH?: boolean;
  ethRedeem?: TokenBalance;
}

export const initialBaseTradeState: BaseTradeState = {
  isReady: false,
  hasError: false,
  canSubmit: false,
  confirm: false,
  inputsSatisfied: false,
  redeemToWETH: false,
  calculationSuccess: false,
  maxWithdraw: false,
  inputErrors: false,
};

export const initialVaultTradeState: VaultTradeState = {
  ...initialBaseTradeState,
  underMinAccountBorrow: false,
  overCapacityError: false,
  overPoolCapacityError: false,
};

export const initialNOTETradeState: NOTETradeState = {
  ...initialBaseTradeState,
  underMinAccountBorrow: false,
  overCapacityError: false,
  overPoolCapacityError: false,
};

export function isVaultTrade(tradeType?: AllTradeTypes) {
  if (!tradeType) return false;
  return Object.keys(VaultTradeConfiguration).includes(tradeType);
}

export function isRollOrConvert(tradeType?: AllTradeTypes) {
  if (!tradeType) return false;
  return (
    tradeType === 'RollDebt' ||
    tradeType === 'ConvertAsset' ||
    tradeType === 'RollVaultPosition'
  );
}

export function isLeveragedTrade(tradeType?: AllTradeTypes) {
  if (!tradeType) return false;
  return (
    isVaultTrade(tradeType) ||
    tradeType === 'LeveragedLend' ||
    tradeType === 'LeveragedNToken' ||
    tradeType === 'IncreaseLeveragedNToken' ||
    tradeType === 'LeveragedNTokenAdjustLeverage'
  );
}

export function isDeleverageTrade(tradeType?: AllTradeTypes) {
  if (!tradeType) return false;
  return (
    tradeType === 'Deleverage' ||
    tradeType === 'DeleverageWithdraw' ||
    tradeType === 'LeveragedNTokenAdjustLeverage'
  );
}

export function isDeleverageWithSwappedTokens(s?: BaseTradeState) {
  if (!s?.tradeType) return false;
  return (
    s?.tradeType === 'Deleverage' ||
    s?.tradeType === 'DeleverageWithdraw' ||
    (s?.tradeType === 'LeveragedNTokenAdjustLeverage' &&
      s?.collateral?.tokenType !== 'nToken')
  );
}

export const clearTradeState: TransactionState = {
  confirm: false,
  inputsSatisfied: false,
  calculationSuccess: false,
  canSubmit: false,
  calculateInputKeys: undefined,
  populatedTransaction: undefined,
  transactionError: undefined,
  netAssetBalance: undefined,
  netDebtBalance: undefined,
  netRealizedCollateralBalance: undefined,
  netRealizedDebtBalance: undefined,
  postTradeBalances: undefined,
};
