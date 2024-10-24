import {
  NotionalTypes,
  TokenDefinitionModel,
} from '@notional-finance/core-entities';
import { AllTradeTypes } from '@notional-finance/notionable';
import { types } from 'mobx-state-tree';

export const TokenOptionModel = types.model('TokenOption', {
  token: types.reference(TokenDefinitionModel),
  balance: types.maybe(NotionalTypes.TokenBalance),
  interestRate: types.maybe(types.number),
  error: types.maybe(types.string),
  utilization: types.maybe(types.number),
});

export const TradeModel = types.model('TradeModel', {
  /** A key into the trade configuration object */
  tradeType: types.enumeration<AllTradeTypes>('TradeType', ['LendVariable']),
  /** True if the page is ready to be displayed */
  isReady: types.optional(types.boolean, false),
  /** A list of tokens that can be deposited */
  availableDepositTokens: types.optional(types.array(TokenDefinitionModel), []),
  /** A list of collateral tokens that can be selected */
  availableCollateralTokens: types.optional(
    types.array(TokenDefinitionModel),
    []
  ),
  /** A list of debt tokens that can be selected */
  availableDebtTokens: types.optional(types.array(TokenDefinitionModel), []),
  /** A parameter key set by the url params */
  sideDrawerKey: types.optional(types.maybe(types.string), undefined),
  /** Maximum collateral slippage for the vault */
  maxCollateralSlippage: types.optional(types.maybe(types.number), undefined),

  /** Symbol of the selected deposit token, if any */
  selectedDepositToken: types.optional(types.maybe(types.string), undefined),
  /**
   * Symbol of the selected token on portfolio transaction screens such as withdraw,
   * repay debt, and roll maturity
   */
  selectedToken: types.optional(types.maybe(types.string), undefined),
  /** NOTE: this is currently unused throughout the site */
  redeemToWETH: types.optional(types.boolean, false),
  /** Signals that the input is a max withdraw or max repayment */
  maxWithdraw: types.optional(types.boolean, false),
  /** True if there are any input validation errors */
  inputErrors: types.optional(types.boolean, false),

  /** Selected network for the current trade, the user can change this */
  selectedNetwork: types.optional(
    types.maybe(NotionalTypes.Network),
    undefined
  ),

  /** Used as a flag to reset the state on path changes */
  reset: types.optional(types.boolean, false),

  /** The current URL path for tracking URL route updates */
  pathname: types.optional(types.maybe(types.string), undefined),

  /** Collateral token definition */
  collateral: types.optional(types.maybe(TokenDefinitionModel), undefined),
  /** Debt token definition */
  debt: types.optional(types.maybe(TokenDefinitionModel), undefined),
  /** Deposit token definition, always in underlying */
  deposit: types.optional(types.maybe(TokenDefinitionModel), undefined),

  /** Parsed from selected risk factors */
  leverageRatio: types.maybe(types.number),
  /** Calculated deposit balance, always in underlying */
  depositBalance: types.optional(
    types.maybe(NotionalTypes.TokenBalance),
    undefined
  ),
  /** A secondary deposit balance, used for NOTE balances in staking */
  secondaryDepositBalance: types.optional(
    types.maybe(NotionalTypes.TokenBalance),
    undefined
  ),
  /** Calculated deposit balance, always in `collateral` token denomination */
  collateralBalance: types.optional(
    types.maybe(NotionalTypes.TokenBalance),
    undefined
  ),
  /** Calculated deposit balance, always in `debt` token denomination */
  debtBalance: types.optional(
    types.maybe(NotionalTypes.TokenBalance),
    undefined
  ),
  /** Calculated fee for creating collateral balance, always in prime cash token denomination */
  collateralFee: types.optional(
    types.maybe(NotionalTypes.TokenBalance),
    undefined
  ),
  /** Calculated fee for creating debt balance, always in prime cash token denomination */
  debtFee: types.optional(types.maybe(NotionalTypes.TokenBalance), undefined),
  /** Error message from calculation */
  calculateError: types.maybe(types.string),
  /** Alternative debt options given if all the inputs are satisfied */
  debtOptions: types.optional(types.array(TokenOptionModel), []),
  /** Alternative collateral options given if all the inputs are satisfied */
  collateralOptions: types.optional(types.array(TokenOptionModel), []),

  /** Default leverage ratio for the selected debt and collateral */
  defaultLeverageRatio: types.maybe(types.number),
  /** Minimum allowed leverage ratio (only applies to vaults) */
  minLeverageRatio: types.maybe(types.number),
  /** Maximum allowed leverage ratio */
  maxLeverageRatio: types.maybe(types.number),

  /** True if all the required inputs are satisfied */
  inputsSatisfied: types.optional(types.boolean, false),
  /** True if all calculations have been completed */
  calculationSuccess: types.optional(types.boolean, false),
  /** True if the calculations are successful and the risk check has completed */
  canSubmit: types.optional(types.boolean, false),
  /** True if the form is in the confirmation state */
  confirm: types.optional(types.boolean, false),
  /** Transaction call information for the confirmation page */
  populatedTransaction: types.maybe(types.frozen({})),
  /** Error creating transaction */
  transactionError: types.maybe(types.string),
  /** Simulation error transaction */
  simulationError: types.maybe(types.string),

  /** Net amount of assets, when rolling refers to the new asset */
  netAssetBalance: types.maybe(NotionalTypes.TokenBalance),
  /** Net amount of debts, when rolling refers to the new debt  */
  netDebtBalance: types.maybe(NotionalTypes.TokenBalance),
  /** Net cost of assets in underlying terms */
  netRealizedCollateralBalance: types.maybe(NotionalTypes.TokenBalance),
  /** Net cost of debts in underlying terms*/
  netRealizedDebtBalance: types.maybe(NotionalTypes.TokenBalance),

  /** Calculated updates to the account balances post trade */
  postTradeBalances: types.optional(
    types.array(NotionalTypes.TokenBalance),
    []
  ),
  /** Calculated incentives to the account balances post trade */
  postTradeIncentives: types.optional(
    types.array(NotionalTypes.TokenBalance),
    []
  ),
});
