import {
  NotionalTypes,
  TokenDefinition,
  TokenDefinitionModel,
} from '@notional-finance/core-entities';
import {
  AllTradeTypes,
  isDeleverageWithSwappedTokens,
  isLeveragedTrade,
  TradeState,
} from '../../base-trade/base-trade-store';
import { getRoot, Instance, types } from 'mobx-state-tree';
import { RootStoreInterface } from '../root-store';
import { getTradeConfig } from '../../base-trade/trade-calculation';
import {
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';

type Category = 'Collateral' | 'Debt' | 'Deposit';

export const TokenDefinitionReference = types.reference(TokenDefinitionModel, {
  get(identifier, parent) {
    const root = getRoot<RootStoreInterface>(parent);
    const model = root.getNetworkClient(root.network);
    return model.getTokenByID(identifier.toString()) as Instance<
      typeof TokenDefinitionModel
    >;
  },
  set(value) {
    return value.id;
  },
});

export const TokenOptionModel = types.model('TokenOption', {
  token: TokenDefinitionReference,
  balance: types.maybe(NotionalTypes.TokenBalance),
  interestRate: types.maybe(types.number),
  error: types.maybe(types.string),
  utilization: types.maybe(types.number),
});

export const TradeModel = types
  .model('TradeModel', {
    /** A key into the trade configuration object */
    tradeType: types.enumeration<AllTradeTypes>('TradeType', ['LendVariable']),
    /** True if the page is ready to be displayed */
    isReady: types.optional(types.boolean, false),
    /** Selected network for the current trade, the user can change this */
    selectedNetwork: NotionalTypes.Network,

    /** A list of tokens that can be deposited */
    availableDepositTokens: types.optional(
      types.array(TokenDefinitionReference),
      []
    ),
    /** A list of collateral tokens that can be selected */
    availableCollateralTokens: types.optional(
      types.array(TokenDefinitionReference),
      []
    ),
    /** A list of debt tokens that can be selected */
    availableDebtTokens: types.optional(
      types.array(TokenDefinitionReference),
      []
    ),
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

    /** The current URL path for tracking URL route updates */
    pathname: types.optional(types.maybe(types.string), undefined),

    /** Collateral token definition */
    collateral: types.maybe(TokenDefinitionReference),
    /** Debt token definition */
    debt: types.maybe(TokenDefinitionReference),
    /** Deposit token definition, always in underlying */
    deposit: types.maybe(TokenDefinitionReference),

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
  })
  .actions((self) => {
    const root = () => getRoot<RootStoreInterface>(self);

    const getDefaultTokens = (
      availableTokens: TokenDefinition[],
      category: Category,
      tradeType?: AllTradeTypes
    ) => {
      if (tradeType === 'LendFixed' && category === 'Collateral') {
        return availableTokens[0];
      } else if (tradeType === 'BorrowFixed' && category === 'Debt') {
        return availableTokens[0];
      } else if (tradeType === 'LeveragedNToken' && category === 'Debt') {
        return availableTokens.find((t) => t.tokenType === 'PrimeDebt');
      } else if (tradeType === 'CreateVaultPosition') {
        return availableTokens.find(
          (t) => t.maturity === PRIME_CASH_VAULT_MATURITY
        );
      } else {
        return undefined;
      }
    };

    /** Ensures that tokens are automatically selected or cleared when they change */
    const getSelectedToken = (
      availableTokens: TokenDefinition[],
      selectedToken: string | undefined,
      category: Category,
      tradeType?: AllTradeTypes
    ) => {
      if (availableTokens.length === 1) {
        return availableTokens[0];
      } else if (selectedToken === undefined) {
        return getDefaultTokens(availableTokens, category, tradeType);
      } else {
        return availableTokens.find((t) => t.symbol === selectedToken);
      }
    };

    const setAvailableDepositTokens = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const account = root().getAccountDefinition(self.selectedNetwork);
      const { depositFilter } = getTradeConfig(self.tradeType);
      const listedTokens = model.getAllTokens();

      const availableDepositTokens = listedTokens
        .filter((t) => t.tokenType === 'Underlying' && !!t.currencyId)
        .filter((t) =>
          depositFilter
            ? depositFilter(
                t,
                account,
                self as unknown as TradeState,
                listedTokens
              )
            : true
        );
      self.availableDepositTokens.replace(
        availableDepositTokens as Instance<typeof TokenDefinitionModel>[]
      );

      self.deposit = getSelectedToken(
        availableDepositTokens,
        self.selectedDepositToken,
        'Deposit',
        self.tradeType
      ) as Instance<typeof TokenDefinitionModel> | undefined;
    };

    const setAvailableCollateralTokens = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const account = root().getAccountDefinition(self.selectedNetwork);
      const { collateralFilter } = getTradeConfig(self.tradeType);
      const listedTokens = model.getAllTokens();

      const availableCollateralTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'PrimeCash' ||
            t.tokenType === 'nToken' ||
            (t.tokenType === 'VaultShare' &&
              (t.maturity || 0) > getNowSeconds()) ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false &&
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) =>
          collateralFilter
            ? collateralFilter(
                t,
                account,
                self as unknown as TradeState,
                listedTokens
              )
            : true
        );

      self.availableCollateralTokens.replace(
        availableCollateralTokens as Instance<typeof TokenDefinitionModel>[]
      );

      self.collateral = getSelectedToken(
        availableCollateralTokens,
        self.selectedToken,
        'Collateral',
        self.tradeType
      ) as Instance<typeof TokenDefinitionModel> | undefined;
    };

    const setAvailableDebtTokens = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const account = root().getAccountDefinition(self.selectedNetwork);
      const { debtFilter } = getTradeConfig(self.tradeType);
      const listedTokens = model.getAllTokens();

      const availableDebtTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'nToken' ||
            t.tokenType === 'PrimeDebt' ||
            (t.tokenType === 'VaultDebt' &&
              (t.maturity || 0) > getNowSeconds()) ||
            (t.tokenType === 'fCash' &&
              t.isFCashDebt === false &&
              (t.maturity || 0) > getNowSeconds())
        )
        .filter((t) =>
          debtFilter
            ? debtFilter(
                t,
                account,
                self as unknown as TradeState,
                listedTokens
              )
            : true
        );

      self.availableDebtTokens.replace(
        availableDebtTokens as Instance<typeof TokenDefinitionModel>[]
      );

      self.debt = getSelectedToken(
        availableDebtTokens,
        self.selectedToken,
        'Debt',
        self.tradeType
      ) as Instance<typeof TokenDefinitionModel> | undefined;
    };

    const afterAttach = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      // Set deposit token
      self.deposit = self.selectedDepositToken
        ? (model.getTokenBySymbol(self.selectedDepositToken) as Instance<
            typeof TokenDefinitionModel
          >)
        : undefined;

      // Set selected portfolio token
      if (self.selectedToken) {
        const selected = model.getTokenBySymbol(self.selectedToken) as Instance<
          typeof TokenDefinitionModel
        >;
        if (self.tradeType === 'Deposit') {
          self.deposit = model.getTokenBySymbol(self.selectedToken) as Instance<
            typeof TokenDefinitionModel
          >;
          self.collateral = model.getPrimeCash(selected.currencyId) as Instance<
            typeof TokenDefinitionModel
          >;
        } else if (self.tradeType === 'RepayDebt') {
          self.collateral =
            selected.tokenType === 'PrimeDebt'
              ? (model.getPrimeCash(selected.currencyId) as Instance<
                  typeof TokenDefinitionModel
                >)
              : selected;
        } else if (
          self.tradeType === 'Withdraw' ||
          self.tradeType === 'RollDebt'
        ) {
          self.debt =
            selected.tokenType === 'PrimeCash'
              ? (model.getPrimeDebt(selected.currencyId) as Instance<
                  typeof TokenDefinitionModel
                >)
              : selected;
        } else if (self.tradeType === 'RollVaultPosition') {
          self.debt = selected;
        }
      }

      if (
        isDeleverageWithSwappedTokens({
          tradeType: self.tradeType,
          collateral: self.collateral as TokenDefinition,
        })
      ) {
        const l = root()
          .getNetworkClient(self.selectedNetwork)
          .getLeverageRatios(
            // Swap the collateral and debt in this case
            self.debt as TokenDefinition,
            self.collateral as TokenDefinition
          );
        self.defaultLeverageRatio = l.defaultLeverageRatio;
        self.minLeverageRatio = l.minLeverageRatio;
        self.maxLeverageRatio = l.maxLeverageRatio;
      } else if (isLeveragedTrade(self.tradeType)) {
        const l = root()
          .getNetworkClient(self.selectedNetwork)
          .getLeverageRatios(
            self.collateral as TokenDefinition,
            self.debt as TokenDefinition
          );
        self.defaultLeverageRatio = l.defaultLeverageRatio;
        self.minLeverageRatio = l.minLeverageRatio;
        self.maxLeverageRatio = l.maxLeverageRatio;
      }

      setAvailableDepositTokens();
      setAvailableCollateralTokens();
      setAvailableDebtTokens();

      console.log(
        'afterAttach',
        self.selectedDepositToken,
        self.selectedNetwork,
        self.tradeType
      );
      self.isReady = true;
    };

    // TODO: ideally refactor update state to be more explicit
    const updateState = () => {
      // TODO: allow setting of certain values:
      // - leverage ratio, collateral, debt, deposit
      // - depositBalance, collateralBalance, debtBalance
      // TODO: if all inputs are satisfied, run a calculations
    };

    return { afterAttach, updateState };
  });
