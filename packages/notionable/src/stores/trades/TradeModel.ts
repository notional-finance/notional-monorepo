import {
  fCashMarket,
  NotionalTypes,
  PendlePT,
  SingleSidedLP,
  TokenBalance,
  TokenDefinition,
  TokenDefinitionModel,
  VaultAdapter,
} from '@notional-finance/core-entities';
import {
  AllTradeTypes,
  isDeleverageWithSwappedTokens,
  isLeveragedTrade,
  isVaultTrade,
  NOTETradeType,
  TradeState,
} from '../../base-trade/base-trade-store';
import { flow, getParent, getRoot, Instance, types } from 'mobx-state-tree';
import { NetworkClientModelType, RootStoreInterface } from '../root-store';
import { getTradeConfig } from '../../base-trade/trade-calculation';
import {
  formatNumberAsPercent,
  getChangeType,
  getNowSeconds,
  leveragedYield,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
  zipByKeyToArray,
} from '@notional-finance/util';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  formatNumberAsPercentWithUndefined,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  CalculationFn,
  CalculationFnParams,
} from '@notional-finance/transaction';

type Category = 'Collateral' | 'Debt' | 'Deposit';

const TokenDefinitionReference = types.reference(TokenDefinitionModel, {
  get(identifier, parent) {
    const root = () => getRoot<RootStoreInterface>(parent);
    const selectedNetwork =
      parent?.selectedNetwork ||
      getParent<Instance<typeof TradeModel>>(parent)?.selectedNetwork;
    if (!selectedNetwork)
      throw Error('Token Definition parent reference not found');
    const model = root().getNetworkClient(selectedNetwork);
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
    tradeType: types.enumeration<AllTradeTypes>('TradeType', [
      'LendVariable',
      'LendFixed',
      'MintNToken',
      'BorrowVariable',
      'BorrowFixed',
      'Deposit',
      'Withdraw',
      'ConvertAsset',
      'RepayDebt',
      'RollDebt',
    ]),
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
    /** Address of the vault, if any */
    vaultAddress: types.optional(types.maybe(types.string), undefined),
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
    /** True if the form is in the confirmation state */
    confirm: types.optional(types.boolean, false),
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
                {
                  deposit: self.deposit as TokenDefinition | undefined,
                  collateral: self.collateral as TokenDefinition | undefined,
                  debt: self.debt as TokenDefinition | undefined,
                  vaultAddress: self.vaultAddress,
                  vaultConfig: self.vaultAddress
                    ? model.getVaultConfig(self.vaultAddress)
                    : undefined,
                },
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
                {
                  deposit: self.deposit as TokenDefinition | undefined,
                  collateral: self.collateral as TokenDefinition | undefined,
                  debt: self.debt as TokenDefinition | undefined,
                  vaultAddress: self.vaultAddress,
                  vaultConfig: self.vaultAddress
                    ? model.getVaultConfig(self.vaultAddress)
                    : undefined,
                },
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
        'trade model afterAttach',
        self.selectedDepositToken,
        self.selectedNetwork,
        self.tradeType
      );
      self.isReady = true;
    };

    const calculate = () => {
      const {
        requiredArgs,
        calculationFn,
        calculateDebtOptions,
        calculateCollateralOptions,
      } = getTradeConfig(self.tradeType);
      let inputsSatisfied = true;

      const inputs = requiredArgs.reduce((acc, arg) => {
        if (arg === 'collateralPool' && self.collateral?.currencyId) {
          acc['collateralPool'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getNotionalMarket(self.collateral.currencyId);
        } else if (arg === 'debtPool' && self.debt?.currencyId) {
          acc['debtPool'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getNotionalMarket(self.debt.currencyId);
        } else if (arg === 'vaultAdapter' && self.vaultAddress) {
          acc['vaultAdapter'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getVaultAdapter(self.vaultAddress);
        } else if (arg === 'balances') {
          acc['balances'] = root().getAccountDefinition(
            self.selectedNetwork
          )?.balances;
        } else if (arg === 'vaultLastUpdateTime' && self.vaultAddress) {
          const accountDefinition = root().getAccountDefinition(
            self.selectedNetwork
          );

          if (accountDefinition?.vaultLastUpdateTime) {
            acc['vaultLastUpdateTime'] =
              accountDefinition.vaultLastUpdateTime[self.vaultAddress];
          } else {
            acc['vaultLastUpdateTime'] = 0;
          }
        } else if (self[arg] === undefined) {
          inputsSatisfied = false;
        }
        acc[arg] = self[arg];
        return acc;
      }, {} as Record<CalculationFnParams, unknown>);

      if (inputsSatisfied) {
        try {
          const outputs = calculationFn(inputs as any);
          if (outputs) {
            Object.keys(outputs).forEach((key) => {
              self[key] = outputs[key];
            });
          }

          self.calculationSuccess = true;
          self.calculateError = undefined;
        } catch (e) {
          self.calculationSuccess = false;
          self.calculateError = (e as Error).toString();
          // Clear any calculated inputs that are not required for the trade type
          requiredArgs.forEach((arg) => {
            if (arg === 'collateral' && self.tradeType !== 'RollDebt') {
              self.collateralBalance = undefined;
            } else if (arg === 'debt' && self.tradeType !== 'ConvertAsset') {
              self.debtBalance = undefined;
            } else if (arg === 'deposit') {
              self.depositBalance = undefined;
            }
          });
          self.netRealizedCollateralBalance = undefined;
          self.netRealizedDebtBalance = undefined;
          self.debtFee = undefined;
          self.collateralFee = undefined;
        }
      }
      self.inputsSatisfied = inputsSatisfied;

      if (
        calculateCollateralOptions &&
        self.availableCollateralTokens &&
        requiredArgs
          .filter((c) => c !== 'collateral')
          .every((r) => inputs[r] !== undefined) &&
        (inputs['collateralPool'] !== undefined ||
          inputs['vaultAdapter'] !== undefined)
      ) {
        self.collateralOptions.replace(
          computeCollateralOptions(
            inputs,
            calculationFn,
            self.availableCollateralTokens as TokenDefinition[],
            inputs['collateralPool'] as fCashMarket | undefined,
            self.tradeType,
            inputs['vaultAdapter'] as VaultAdapter | undefined,
            root().getNetworkClient(self.selectedNetwork)
          ) || []
        );
      }

      if (
        calculateDebtOptions &&
        self.availableDebtTokens &&
        requiredArgs
          .filter((c) => c !== 'debt')
          .filter((c) =>
            isVaultTrade(self.tradeType) ? c !== 'collateral' : true
          )
          .every((r) => inputs[r] !== undefined) &&
        inputs['debtPool'] !== undefined
      ) {
        self.debtOptions.replace(
          computeDebtOptions(
            inputs,
            calculationFn,
            self.availableDebtTokens as TokenDefinition[],
            inputs['debtPool'] as fCashMarket,
            self.tradeType,
            root().getNetworkClient(self.selectedNetwork)
          ) || []
        );
      }
    };

    const setDepositBalance = (
      balance: TokenBalance | undefined,
      maxWithdraw = false
    ) => {
      self.depositBalance = balance;
      self.maxWithdraw = maxWithdraw;
      calculate();
    };

    const setHasInputErrors = (inputErrors: boolean) => {
      self.inputErrors = inputErrors;
    };

    const setConfirm = (confirm: boolean) => {
      self.confirm = confirm;
    };

    const buildTransaction = flow(function* () {
      if (self.confirm === false) {
        return {
          populatedTransaction: undefined,
          transactionError: undefined,
        };
      }

      const account = root().getAccountDefinition(self.selectedNetwork);
      if (!account) {
        return {
          populatedTransaction: undefined,
          transactionError: 'Account not found',
        };
      }

      const config = getTradeConfig(self.tradeType);
      // Using the risk profile here ensures that we use settled balances
      const accountBalances = new AccountRiskProfile(
        account.balances,
        account.network
      ).balances;

      try {
        const populatedTransaction = yield config.transactionBuilder({
          ...self,
          accountBalances,
          vaultLastUpdateTime: account.vaultLastUpdateTime || {},
          address: account.address,
          network: account.network,
        });

        return {
          populatedTransaction,
          transactionError: undefined,
        };
        // TODO: add simulation
      } catch (e) {
        // Log these errors in full to the console
        const _reason = (e as { reason: string })['reason'];
        const parsedReason = _reason.replace(/execution\sreverted:?/, '');
        return {
          populatedTransaction: undefined,
          transactionError: parsedReason
            ? `Transaction will revert: ${parsedReason}`
            : 'Transaction will revert based on inputs.',
        };
      }
    });

    return {
      afterAttach,
      setHasInputErrors,
      setDepositBalance,
      setConfirm,
      buildTransaction,
    };
  })
  .views((self) => {
    const root = () => getRoot<RootStoreInterface>(self);
    const mergeLiquidationPrices = (
      prior: (ReturnType<
        AccountRiskProfile['getAllLiquidationPrices']
      >[number] & {
        debt?: TokenDefinition;
      })[],
      post: (ReturnType<
        AccountRiskProfile['getAllLiquidationPrices']
      >[number] & {
        debt?: TokenDefinition;
      })[]
    ) => {
      return zipByKeyToArray(prior, post, (t) => t.asset.id).map(
        ([current, updated]) => {
          const asset = (current?.asset || updated?.asset) as TokenDefinition;
          const debt = (current?.debt || updated?.debt) as
            | TokenDefinition
            | undefined;

          return {
            asset,
            debt,
            current: current?.threshold,
            updated: updated?.threshold,
            changeType: getChangeType(
              current?.threshold?.toFloat(),
              updated?.threshold?.toFloat()
            ),
            // Debt thresholds improve as they increase
            greenOnArrowUp: updated?.isDebtThreshold ? true : false,
            isPriceRisk: asset.tokenType === 'Underlying',
            isAssetRisk: asset.tokenType !== 'Underlying',
          };
        }
      );
    };

    const comparePortfolio = (prior: TokenBalance[], post: TokenBalance[]) => {
      return zipByKeyToArray(prior, post, (t) => t.tokenId)
        .map(([_current, _updated]) => {
          const updated = (_updated || _current?.copy(0)) as TokenBalance;
          const current = (_current || _updated?.copy(0)) as TokenBalance;
          const { titleWithMaturity } =
            updated.tokenType === 'PrimeCash' && current.isNegative()
              ? formatTokenType(current.toPrimeDebt().token)
              : formatTokenType(current.token);

          return {
            label: titleWithMaturity,
            current: current,
            isCurrentNegative: current.isNegative(),
            updated: updated,
            isUpdatedNegative: updated.isNegative(),
            sortOrder: updated.sub(current).abs().toFloat(),
            changeType: getChangeType(current.toFloat(), updated.toFloat()),
          };
        })
        .filter(
          ({ current, updated }) => !current.isZero() || !updated.isZero()
        )
        .sort((a, b) => b.sortOrder - a.sortOrder);
    };

    const getPostTradeSummary = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const newBalances = [self.collateralBalance, self.debtBalance].filter(
        (b) => b !== undefined
      ) as TokenBalance[];

      return self.calculationSuccess &&
        (self.collateralBalance || self.debtBalance)
        ? AccountRiskProfile.simulate(account?.balances || [], newBalances)
        : undefined;
    };

    const getPortfolioComparison = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const postBalances = getPostTradeSummary()?.balances;
      const priorBalances = account?.portfolioRiskProfile?.balances;
      return priorBalances && postBalances
        ? comparePortfolio(priorBalances, postBalances)
        : [];
    };

    const getTradeLiquidationPrices = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const postTrade = getPostTradeSummary()?.getAllLiquidationPrices();
      const preTrade = account?.portfolioLiquidationPrices;
      return {
        postTrade,
        preTrade,
      };
    };

    const getPostTradeIncentives = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const accruedIncentives = account
        ? account.calculateAccruedIncentives().accruedIncentives
        : undefined;
      return (
        accruedIncentives
          ?.filter(
            ({ currencyId }) =>
              (self.collateralBalance?.tokenType === 'nToken' &&
                self.collateralBalance.currencyId === currencyId) ||
              (self.debtBalance?.tokenType === 'nToken' &&
                self.debtBalance.currencyId === currencyId)
          )
          .flatMap(({ incentives }) => incentives)
          .filter((i) => i.isPositive()) || []
      );
    };

    const getRiskSummary = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const priorAccountRisk = account?.portfolioRiskProfile;
      const priorLiquidationPrice = account?.portfolioLiquidationPrices;
      const postAccountRisk = getPostTradeSummary()?.getAllRiskFactors();

      return {
        onlyCurrent: !postAccountRisk,
        tooRisky: postAccountRisk?.freeCollateral.isNegative() || false,
        priorAccountNoRisk:
          priorAccountRisk === undefined ||
          (priorAccountRisk?.healthFactor === null &&
            priorLiquidationPrice?.length === 0),
        postAccountNoRisk:
          postAccountRisk?.healthFactor === null &&
          postAccountRisk?.liquidationPrice.length === 0,
        healthFactor: {
          current: priorAccountRisk?.healthFactor,
          updated: postAccountRisk?.healthFactor,
          changeType: getChangeType(
            priorAccountRisk?.healthFactor,
            postAccountRisk?.healthFactor
          ),
          greenOnArrowUp: true,
        },
        liquidationPrice: mergeLiquidationPrices(
          priorLiquidationPrice?.map((p) => ({
            ...p,
            asset: root()
              .getNetworkClient(self.selectedNetwork)
              .getTokenByID(p.asset),
          })) || [],
          postAccountRisk?.liquidationPrice || []
        ),
      };
    };

    const getPriorVaultBalances = () => {
      const account = root().getAccountDefinition(self.selectedNetwork);
      return account && self.vaultAddress
        ? VaultAccountRiskProfile.fromAccount(self.vaultAddress, account)
            ?.balances
        : undefined;
    };

    const getPostVaultRiskProfile = () => {
      const account = root().getAccountDefinition(self.selectedNetwork);
      const priorVaultRisk =
        account && self.vaultAddress
          ? VaultAccountRiskProfile.fromAccount(self.vaultAddress, account)
          : undefined;

      const postVaultRisk =
        self.calculationSuccess &&
        self.collateralBalance &&
        self.debtBalance &&
        self.vaultAddress
          ? (self.tradeType === 'RollVaultPosition' ||
              self.tradeType === 'CreateVaultPosition') &&
            self.debtBalance
            ? new VaultAccountRiskProfile(
                self.vaultAddress,
                [self.collateralBalance, self.debtBalance],
                0
              )
            : priorVaultRisk?.simulate(
                [self.collateralBalance, self.debtBalance].filter(
                  (b) => b !== undefined
                ) as TokenBalance[]
              )
          : undefined;

      return {
        priorVaultRisk,
        postVaultRisk,
      };
    };

    const getPostVaultFactors = () => {
      const { postVaultRisk } = getPostVaultRiskProfile();
      return postVaultRisk?.getAllRiskFactors();
    };

    const getVaultRiskSummary = () => {
      const baseCurrency = root().appStore.baseCurrency;
      const { priorVaultRisk, postVaultRisk } = getPostVaultRiskProfile();

      const priorBorrowRate = priorVaultRisk?.borrowAPY;
      const priorAPY = priorVaultRisk?.totalAPY;
      const newBorrowRate = self.debtOptions?.find(
        (t) => t.token.id === self.debtBalance?.tokenId
      )?.interestRate;
      const postBorrowRate =
        postVaultRisk?.maturity === PRIME_CASH_VAULT_MATURITY
          ? newBorrowRate
          : averageFixedRate(priorVaultRisk, postVaultRisk, newBorrowRate);
      const vaultSharesAPY = postVaultRisk?.vaultShares?.tokenId
        ? root()
            .getNetworkClient(self.selectedNetwork)
            .getSpotAPY(postVaultRisk.vaultShares.tokenId)?.totalAPY
        : undefined;

      const postAPY = leveragedYield(
        vaultSharesAPY,
        postBorrowRate,
        postVaultRisk?.leverageRatio() || 0
      );

      return {
        onlyCurrent: !postVaultRisk,
        tooRisky: postVaultRisk?.aboveMaxLeverageRatio() || false,
        priorAccountNoRisk:
          priorVaultRisk === undefined ||
          priorVaultRisk?.leverageRatio() === null,
        postAccountNoRisk:
          postVaultRisk === undefined ||
          postVaultRisk?.leverageRatio() === null,
        healthFactor: {
          current: priorVaultRisk?.healthFactor(),
          updated: postVaultRisk?.healthFactor(),
          changeType: getChangeType(
            priorVaultRisk?.healthFactor(),
            postVaultRisk?.healthFactor()
          ),
          greenOnArrowUp: true,
        },
        liquidationPrice: mergeLiquidationPrices(
          priorVaultRisk?.getAllLiquidationPrices() || [],
          postVaultRisk?.getAllLiquidationPrices() || []
        ),
        netWorth: {
          current:
            priorVaultRisk
              ?.netWorth()
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false) || '-',
          updated:
            postVaultRisk
              ?.netWorth()
              .toFiat(baseCurrency)
              .toDisplayStringWithSymbol(2, true, false) || '-',
          changeType: getChangeType(
            priorVaultRisk?.netWorth().toFloat(),
            postVaultRisk?.netWorth().toFloat()
          ),
          greenOnArrowUp: true,
        },
        borrowAPY: {
          current: formatNumberAsPercentWithUndefined(priorBorrowRate, '-'),
          updated: formatNumberAsPercentWithUndefined(postBorrowRate, '-'),
          changeType: getChangeType(priorBorrowRate, postBorrowRate),
          greenOnArrowUp: false,
        },
        totalAPY: {
          current: formatNumberAsPercentWithUndefined(priorAPY, '-'),
          updated: formatNumberAsPercentWithUndefined(postAPY, '-'),
          changeType: getChangeType(priorAPY, postAPY),
          greenOnArrowUp: true,
        },
      };
    };

    const getVaultCapacity = () => {
      let totalCapacityRemaining: TokenBalance | undefined;
      let totalPoolCapacityRemaining: TokenBalance | undefined;
      let overCapacityError = false;
      let overPoolCapacityError = false;
      let minBorrowSize: string | undefined = undefined;
      let underMinAccountBorrow = false;
      let maxPoolShare: string | undefined;
      const vaultAdapter = root()
        .getNetworkClient(self.selectedNetwork)
        .getVaultAdapter(self.selectedNetwork);
      const vaultCapacity = self.debtBalance?.token
        ? {
            minAccountBorrowSize: TokenBalance.zero(self.debtBalance.token),
            totalUsedPrimaryBorrowCapacity: TokenBalance.zero(
              self.debtBalance.token
            ),
            maxPrimaryBorrowCapacity: TokenBalance.zero(self.debtBalance.token),
          }
        : undefined;
      const priorVaultBalances = getPriorVaultBalances();

      if (vaultCapacity) {
        const {
          minAccountBorrowSize,
          totalUsedPrimaryBorrowCapacity,
          maxPrimaryBorrowCapacity,
        } = vaultCapacity;
        // If the debt balance is the same as the current debt then
        // sum them together, otherwise just go with the new debt balance
        const priorDebtBalance = priorVaultBalances?.find(
          (t) => t.tokenType === 'VaultDebt'
        );
        const totalAccountDebt =
          self.debtBalance &&
          priorDebtBalance?.tokenId === self.debtBalance?.tokenId
            ? priorDebtBalance?.add(self.debtBalance)
            : self.debtBalance;
        underMinAccountBorrow = totalAccountDebt?.isNegative()
          ? toCapacityValue(totalAccountDebt).lt(minAccountBorrowSize)
          : false;
        const netDebtBalanceForCapacity =
          priorDebtBalance && totalAccountDebt
            ? toCapacityValue(totalAccountDebt).sub(
                toCapacityValue(priorDebtBalance)
              )
            : totalAccountDebt
            ? toCapacityValue(totalAccountDebt)
            : undefined;
        if (netDebtBalanceForCapacity && self.debtBalance?.isNegative()) {
          overCapacityError =
            // Over capacity due to borrow
            totalUsedPrimaryBorrowCapacity
              .add(netDebtBalanceForCapacity)
              .gt(maxPrimaryBorrowCapacity);
          overPoolCapacityError =
            vaultAdapter?.strategy === 'SingleSidedLP'
              ? (vaultAdapter as SingleSidedLP).isOverMaxPoolShare(
                  self.collateralBalance
                ) ?? false
              : false;
        }
        totalCapacityRemaining = maxPrimaryBorrowCapacity.sub(
          totalUsedPrimaryBorrowCapacity
        );

        if (vaultAdapter?.strategy === 'SingleSidedLP') {
          totalPoolCapacityRemaining = (
            vaultAdapter as SingleSidedLP
          ).getRemainingPoolCapacity();
          maxPoolShare = (vaultAdapter as SingleSidedLP).maxPoolShares
            ? formatNumberAsPercent(
                (vaultAdapter as SingleSidedLP).maxPoolShares.toNumber() / 100,
                0
              )
            : undefined;
        }

        // NOTE: these two values below do not need to be recalculated inside the observable
        minBorrowSize =
          minAccountBorrowSize.toFloat() < 10
            ? minAccountBorrowSize.toDisplayStringWithSymbol(1)
            : minAccountBorrowSize.toDisplayStringWithSymbol(0);
      }

      return {
        minBorrowSize,
        overCapacityError,
        overPoolCapacityError,
        maxPoolShare,
        underMinAccountBorrow,
        totalCapacityRemaining,
        totalPoolCapacityRemaining,
        vaultTVL: vaultAdapter.getVaultTVL(),
        vaultCapacityError:
          self.tradeType === 'WithdrawVault'
            ? false
            : overCapacityError || underMinAccountBorrow,
      };
    };

    const canSubmit = () => {
      if (self.vaultAddress) {
        const postAccountRisk = getPostVaultRiskProfile().postVaultRisk;
        const leverageRatio = postAccountRisk?.leverageRatio();
        const { vaultCapacityError } = getVaultCapacity();

        return (
          !!postAccountRisk &&
          (leverageRatio === null ||
            (!!postAccountRisk.maxLeverageRatio &&
              !!leverageRatio &&
              leverageRatio < postAccountRisk.maxLeverageRatio)) &&
          vaultCapacityError === false &&
          self.inputErrors === false
        );
      } else {
        const postAccountRisk = getPostTradeSummary();
        return (
          postAccountRisk &&
          (postAccountRisk?.freeCollateral().isPositive() ||
            postAccountRisk?.freeCollateral().isZero()) &&
          self.inputErrors === false
        );
      }
    };

    return {
      get actions() {
        return {
          setDepositBalance: self.setDepositBalance,
          setHasInputErrors: self.setHasInputErrors,
          setConfirm: self.setConfirm,
          buildTransaction: self.buildTransaction,
        };
      },
      get state() {
        // NOTE: this is slow....
        return {
          ...self,
        };
      },
      getRiskSummary,
      getVaultRiskSummary,
      getTradeLiquidationPrices,
      getPortfolioComparison,
      getPriorVaultBalances,
      getPostVaultFactors,
      getVaultCapacity,
      getPostTradeIncentives,
      canSubmit,
    };
  });

function averageFixedRate(
  prior: VaultAccountRiskProfile | undefined,
  post: VaultAccountRiskProfile | undefined,
  newBorrowRate: number | undefined
) {
  if (
    prior?.maturity === post?.maturity &&
    newBorrowRate !== undefined &&
    prior?.lastImpliedFixedRate !== undefined &&
    post?.vaultDebt !== undefined
  ) {
    return (
      (prior.lastImpliedFixedRate * prior.vaultDebt.toFloat() +
        (newBorrowRate - prior.lastImpliedFixedRate) *
          post.vaultDebt.toFloat()) /
      prior.vaultDebt.toFloat()
    );
  } else {
    return newBorrowRate;
  }
}

function toCapacityValue(balance: TokenBalance) {
  return balance.maturity !== PRIME_CASH_VAULT_MATURITY
    ? // fCash is 1-1 in internal precision
      balance.toUnderlying().copy(balance?.n).scaleFromInternal().abs()
    : balance.toUnderlying().abs();
}

function computeCollateralOptions(
  inputs: Record<CalculationFnParams, unknown>,
  calculationFn: CalculationFn,
  options: TokenDefinition[],
  fCashMarket: fCashMarket | undefined,
  tradeType: AllTradeTypes | undefined,
  vaultAdapter: VaultAdapter | undefined,
  model: NetworkClientModelType
) {
  return options.map((c) => {
    const i = { ...inputs, collateral: c };
    try {
      const { collateralBalance, netRealizedCollateralBalance } = calculationFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i as any
      ) as {
        collateralFee: TokenBalance;
        collateralBalance: TokenBalance;
        netRealizedCollateralBalance: TokenBalance;
      };

      return {
        token: c as Instance<typeof TokenDefinitionModel>,
        balance: collateralBalance,
        error: undefined,
        ..._getTradedInterestRate(
          netRealizedCollateralBalance,
          collateralBalance,
          fCashMarket,
          tradeType,
          vaultAdapter,
          model
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        token: c as Instance<typeof TokenDefinitionModel>,
        balance: undefined,
        utilization: undefined,
        interestRate: undefined,
        error: (e as Error).toString(),
      };
    }
  });
}

function computeDebtOptions(
  inputs: Record<CalculationFnParams, unknown>,
  calculationFn: CalculationFn,
  options: TokenDefinition[],
  fCashMarket: fCashMarket,
  tradeType: AllTradeTypes | undefined,
  model: NetworkClientModelType
) {
  return options.map((d) => {
    const i = { ...inputs, debt: d };
    try {
      if (isVaultTrade(tradeType)) {
        // Switch to the matching vault share token for vault trades
        if (!d.vaultAddress || !d.maturity) throw Error('Invalid debt token');
        i['collateral'] = model.getVaultShare(d.vaultAddress, d.maturity);
      }

      const { debtBalance, netRealizedDebtBalance } = calculationFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i as any
      ) as {
        debtFee: TokenBalance;
        debtBalance: TokenBalance;
        netRealizedDebtBalance: TokenBalance;
      };

      return {
        token: d as Instance<typeof TokenDefinitionModel>,
        balance: debtBalance,
        error: undefined,
        ..._getTradedInterestRate(
          netRealizedDebtBalance,
          debtBalance,
          fCashMarket,
          tradeType,
          undefined, // Vault Adapter is not used for debt
          model
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        token: d as Instance<typeof TokenDefinitionModel>,
        balance: undefined,
        interestRate: undefined,
        utilization: undefined,
        error: (e as Error).toString(),
      };
    }
  });
}

function _getTradedInterestRate(
  realized: TokenBalance,
  _amount: TokenBalance,
  fCashMarket: fCashMarket | undefined,
  tradeType: AllTradeTypes | NOTETradeType | undefined,
  vaultAdapter: VaultAdapter | undefined,
  model: NetworkClientModelType
): {
  interestRate: number | undefined;
  utilization: number | undefined;
} {
  let interestRate: number | undefined;
  let utilization: number | undefined;
  const amount = _amount.unwrapVaultToken();
  if (amount.tokenType === 'fCash' && fCashMarket) {
    // We net off the fee for fcash so that we show it as an up-front
    // trading fee rather than part of the implied yield
    interestRate = fCashMarket.getImpliedInterestRate(realized, amount);
  } else if (
    (amount.tokenType === 'PrimeDebt' || amount.tokenType === 'PrimeCash') &&
    (tradeType === 'LeveragedLend' || tradeType === 'LeveragedNToken') &&
    fCashMarket
  ) {
    // If borrowing for leverage it is prime supply + prime debt and the interest rate
    // is always the prime debt rate
    utilization = fCashMarket.getPrimeCashUtilization(
      amount.toPrimeCash().neg(),
      amount.neg()
    );
    interestRate = fCashMarket.getPrimeDebtRate(utilization);
  } else if (amount.tokenType === 'PrimeCash' && fCashMarket) {
    // Increases or decreases the prime supply accordingly
    utilization = fCashMarket.getPrimeCashUtilization(amount, undefined);
    interestRate = fCashMarket.getPrimeSupplyRate(utilization);
  } else if (amount.tokenType === 'PrimeDebt' && fCashMarket) {
    // If borrowing and withdrawing then it is just prime debt increase. This
    // includes vault debt
    utilization = fCashMarket.getPrimeCashUtilization(undefined, amount.neg());
    interestRate = fCashMarket.getPrimeDebtRate(utilization);
    if (_amount.tokenType === 'VaultDebt') {
      // Add the vault fee to the interest rate here..
      const annualizedFeeRate = model.getVaultConfig(
        amount.vaultAddress
      ).feeRateBasisPoints;
      interestRate += annualizedFeeRate;
    }
  } else if (amount.tokenType === 'nToken') {
    return {
      interestRate: model.getSimulatedAPY(amount)?.totalAPY,
      utilization: undefined,
    };
  } else if (
    amount.tokenType === 'VaultShare' &&
    vaultAdapter &&
    vaultAdapter.strategy === 'PendlePT' &&
    // Only calculate this on increasing the position, otherwise it will be based on
    // the current spot APY
    (tradeType === 'IncreaseVaultPosition' ||
      tradeType === 'CreateVaultPosition')
  ) {
    const impliedExchangeRate = amount.toFloat() / realized.toFloat();
    const timeToMaturity = (vaultAdapter as PendlePT).timeToExpiry;
    interestRate = Math.trunc(
      ((Math.log(impliedExchangeRate) * SECONDS_IN_YEAR_ACTUAL) /
        timeToMaturity) *
        RATE_PRECISION
    );
  }

  return {
    interestRate:
      interestRate !== undefined
        ? (interestRate * 100) / RATE_PRECISION
        : undefined,
    utilization,
  };
}
