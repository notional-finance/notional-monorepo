import { TokenDefinitionModel } from '@notional-finance/core-entities';
import { AllTradeTypes } from '@notional-finance/notionable';
import { types } from 'mobx-state-tree';

export const TradeModel = types.model('TradeModel', {
  tradeType: types.enumeration<AllTradeTypes>('TradeType', [
    'Deposit',
    'Withdraw',
    'LendVariable',
    'LendFixed',
    'MintNToken',
    'BorrowVariable',
    'BorrowFixed',
    'RepayDebt',
    'ConvertAsset',
    'RollDebt',
  ]),

  availableDepositTokens: types.optional(
    types.array(types.reference(TokenDefinitionModel)),
    []
  ),
  availableCollateralTokens: types.optional(
    types.array(types.reference(TokenDefinitionModel)),
    []
  ),
  availableDebtTokens: types.optional(
    types.array(types.reference(TokenDefinitionModel)),
    []
  ),
  selectedDepositToken: types.maybe(types.string),
  selectedToken: types.maybe(types.string),

  userInputs: types.optional(
    types.model({
      redeemToWETH: types.boolean,
      maxWithdraw: types.boolean,
      inputErrors: types.boolean,
      leverageRatio: types.maybe(types.number),
    }),
    {
      redeemToWETH: false,
      maxWithdraw: false,
      inputErrors: false,
      leverageRatio: undefined,
    }
  ),
  // tokenInputs: types.model({
  //   collateral: types.maybe(TokenDefinition),
  //   debt: types.maybe(TokenDefinition),
  //   deposit: types.maybe(TokenDefinition),
  //   depositBalance: types.maybe(TokenBalance),
  //   secondaryDepositBalance: types.maybe(TokenBalance),
  //   collateralBalance: types.maybe(TokenBalance),
  //   debtBalance: types.maybe(TokenBalance),
  // }),
  transactionState: types.optional(
    types.model({
      inputsSatisfied: types.boolean,
      calculationSuccess: types.boolean,
      canSubmit: types.boolean,
      confirm: types.boolean,
      transactionError: types.maybe(types.string),
      simulationError: types.maybe(types.string),
    }),
    {
      inputsSatisfied: false,
      calculationSuccess: false,
      canSubmit: false,
      confirm: false,
      transactionError: undefined,
      simulationError: undefined,
    }
  ),
  // transactionSummary: types.model({
  //   netAssetBalance: types.maybe(TokenBalance),
  //   netDebtBalance: types.maybe(TokenBalance),
  //   netRealizedCollateralBalance: types.maybe(TokenBalance),
  //   netRealizedDebtBalance: types.maybe(TokenBalance),
  //   postTradeBalances: types.optional(types.array(TokenBalance), []),
  //   postTradeIncentives: types.optional(types.array(TokenBalance), []),
  //   // TODO: write all the trade summary fields into the model here...
  // }),
});
