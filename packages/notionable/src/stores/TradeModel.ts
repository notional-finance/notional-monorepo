import {
  createLeveragedAPYData,
  fCashMarket,
  getVaultType,
  NotionalTypes,
  PendlePT,
  SingleSidedLP,
  TokenBalance,
  TokenDefinition,
  TokenDefinitionModel,
  VAULT_TYPES,
  VaultAdapter,
} from '@notional-finance/core-entities';
import {
  AllTradeTypes,
  BaseTradeState,
  isDeleverageWithSwappedTokens,
  isLeveragedTrade,
  isNOTEStake,
  isVaultTrade,
  NOTETradeType,
  TokenOption,
  getTradeConfig,
  isDeleverageTrade,
} from '../base-trade/base-trade-store';
import {
  flow,
  getParent,
  getRoot,
  getType,
  Instance,
  isAlive,
  types,
} from 'mobx-state-tree';
import { NetworkClientModelType, RootStoreInterface } from './root-store';
import {
  formatNumberAsPercent,
  getChangeType,
  getNowSeconds,
  leveragedYield,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
  unique,
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
import { getComparisonKey } from '../utils';

type Category = 'Collateral' | 'Debt' | 'Deposit';

const TokenDefinitionReference = types.reference(TokenDefinitionModel, {
  get(identifier, parent) {
    const root = () => getRoot<RootStoreInterface>(parent);
    const parentName = getType(parent).name;
    let selectedNetwork: Network | undefined;
    if (parentName === 'TradeModel') {
      selectedNetwork = parent?.selectedNetwork;
    } else if (parentName === 'TokenOption') {
      selectedNetwork = getParent<Instance<typeof TradeModel>>(
        parent,
        2
      )?.selectedNetwork;
    } else {
      selectedNetwork =
        getParent<Instance<typeof TradeModel>>(parent)?.selectedNetwork;
    }

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
      'LeveragedNToken',
      'LeveragedNTokenAdjustLeverage',
      'IncreaseLeveragedNToken',
      'Deleverage',
      'DeleverageWithdraw',
      'StakeNOTECoolDown',
      'StakeNOTERedeem',
      'StakeNOTE',
      'CreateVaultPosition',
      'IncreaseVaultPosition',
      'AdjustVaultLeverage',
      'RollVaultPosition',
      'WithdrawVault',
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

    /** Net cost of assets in underlying terms */
    netRealizedCollateralBalance: types.maybe(NotionalTypes.TokenBalance),
    /** Net cost of debts in underlying terms*/
    netRealizedDebtBalance: types.maybe(NotionalTypes.TokenBalance),

    /** Calculated updates to the account balances post trade */
    postTradeBalances: types.optional(
      types.array(NotionalTypes.TokenBalance),
      []
    ),

    /** Amount of ETH redeemed during NOTE unstaking */
    ethRedeem: types.maybe(NotionalTypes.TokenBalance),
    /** True if the optimal ETH amount should be used for NOTE staking */
    useOptimalETH: types.optional(types.boolean, false),

    vaultTradeMetadata: types.optional(types.maybe(types.frozen()), undefined),

    /** True if the trade is a deleverage */
    isDeleverage: types.optional(types.boolean, false),

    /** Vault type */
    vaultType: types.optional(
      types.maybe(types.enumeration('VaultType', VAULT_TYPES)),
      undefined
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
      if (category === 'Collateral' && self.collateral) return self.collateral;
      if (category === 'Debt' && self.debt) return self.debt;
      if (category === 'Deposit' && self.deposit) return self.deposit;

      if (availableTokens.length === 1) {
        return availableTokens[0];
      } else if (selectedToken === undefined) {
        return getDefaultTokens(availableTokens, category, tradeType);
      } else {
        return availableTokens.find((t) => t.id === selectedToken);
      }
    };

    const setAvailableDepositTokens = () => {
      // Skip this for NOTE staking
      if (isNOTEStake(self.tradeType)) return;
      // Skip this for vaults
      if (self.vaultAddress) return;

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
                self as unknown as BaseTradeState,
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

    const setInitialComputedOptions = () => {
      const model = root().getNetworkClient(self.selectedNetwork);

      if (self.tradeType === 'LendFixed') {
        self.collateralOptions.replace(
          self.availableCollateralTokens.map((t) => {
            return {
              token: t,
              balance: TokenBalance.zero(t as TokenDefinition),
              interestRate: model.getSpotAPY(t.id).totalAPY,
              error: undefined,
              utilization: undefined,
            };
          })
        );
      } else if (self.tradeType === 'BorrowFixed') {
        self.debtOptions.replace(
          self.availableDebtTokens.map((t) => ({
            token: t,
            balance: TokenBalance.zero(t as TokenDefinition),
            interestRate: model.getSpotAPY(t.id).totalAPY,
            error: undefined,
            utilization: undefined,
          }))
        );
      } else if (
        self.tradeType === 'LeveragedNToken' ||
        self.tradeType === 'CreateVaultPosition'
      ) {
        self.debtOptions.replace(
          self.availableDebtTokens
            .map((t) => ({
              token: t,
              balance: TokenBalance.zero(t as TokenDefinition),
              interestRate: model.getSpotAPY(t.id).totalAPY,
              error: undefined,
              utilization: undefined,
            }))
            .sort((a, b) => sortByMaturity(a.token, b.token))
        );
        self.collateralOptions.replace(
          self.availableCollateralTokens.map((t) => {
            return {
              token: t,
              balance: TokenBalance.zero(t as TokenDefinition),
              interestRate: model.getSpotAPY(t.id).totalAPY,
              error: undefined,
              utilization: undefined,
            };
          })
        );
      } else if (isNOTEStake(self.tradeType)) {
        calculate();
      } else if (self.tradeType === 'ConvertAsset') {
        calculate();
      }
    };

    const afterAttach = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      // Set deposit token
      self.deposit = self.selectedDepositToken
        ? (model.getTokenBySymbol(self.selectedDepositToken) as Instance<
            typeof TokenDefinitionModel
          >)
        : undefined;

      if (self.vaultAddress) {
        self.vaultType = getVaultType(self.vaultAddress, self.selectedNetwork);
        const config = model.getVaultConfig(self.vaultAddress);
        self.deposit = config?.primaryToken as Instance<
          typeof TokenDefinitionModel
        >;
        self.availableDepositTokens.replace([self.deposit]);
        self.minLeverageRatio =
          RATE_PRECISION /
          (config.maxRequiredAccountCollateralRatioBasisPoints as number);
        self.defaultLeverageRatio =
          RATE_PRECISION / config.maxDeleverageCollateralRatioBasisPoints;
        self.maxLeverageRatio =
          RATE_PRECISION / config.minCollateralRatioBasisPoints;
      }

      // Set selected portfolio token
      if (self.selectedToken) {
        let selected: Instance<typeof TokenDefinitionModel>;
        try {
          selected = model.getTokenByID(self.selectedToken) as Instance<
            typeof TokenDefinitionModel
          >;
        } catch (e) {
          selected = model.getTokenBySymbol(self.selectedToken) as Instance<
            typeof TokenDefinitionModel
          >;
        }
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
        } else if (self.tradeType === 'Withdraw') {
          self.debt =
            selected.tokenType === 'PrimeCash'
              ? (model.getPrimeDebt(selected.currencyId) as Instance<
                  typeof TokenDefinitionModel
                >)
              : selected;
        } else if (self.tradeType === 'RollVaultPosition') {
          self.debt = selected;
        } else if (self.tradeType === 'ConvertAsset') {
          const account = root().getNetworkAccount(self.selectedNetwork);
          const priorBalances = account?.portfolioRiskProfile?.balances;
          const debtBalance = priorBalances?.find(
            (t) => t.tokenId === self.selectedToken
          );
          self.debt =
            selected.tokenType === 'PrimeCash'
              ? (model.getPrimeDebt(selected.currencyId) as Instance<
                  typeof TokenDefinitionModel
                >)
              : selected;
          self.debtBalance = debtBalance?.toPrimeDebt().neg();
        } else if (self.tradeType === 'RollDebt') {
          const account = root().getNetworkAccount(self.selectedNetwork);
          const priorBalances = account?.portfolioRiskProfile?.balances;
          const collateralBalance = priorBalances?.find(
            (t) => t.tokenId === self.selectedToken
          );
          self.collateral = collateralBalance?.token as Instance<
            typeof TokenDefinitionModel
          >;
          self.collateralBalance = collateralBalance;
        }
      }

      if (isNOTEStake(self.tradeType)) {
        const stakeNOTEStatus = root().getAccountDefinition(
          self.selectedNetwork
        )?.stakeNOTEStatus;
        const sNOTE = model.getTokenBySymbol('sNOTE') as Instance<
          typeof TokenDefinitionModel
        >;

        if (stakeNOTEStatus?.inCoolDown) {
          self.collateral = sNOTE;
          self.tradeType = 'StakeNOTECoolDown';
        } else if (stakeNOTEStatus?.inRedeemWindow) {
          self.deposit = sNOTE;
          self.availableDepositTokens.replace([sNOTE]);
          self.tradeType = 'StakeNOTERedeem';
        } else {
          // This is the normal case, just staking NOTE
          const ETH = model.getTokenBySymbol('ETH') as Instance<
            typeof TokenDefinitionModel
          >;
          const WETH = model.getTokenBySymbol('WETH') as Instance<
            typeof TokenDefinitionModel
          >;
          self.tradeType = 'StakeNOTE';
          self.availableDepositTokens.replace([ETH, WETH]);
          self.availableCollateralTokens.replace([sNOTE]);
          self.collateral = sNOTE;
          self.useOptimalETH = true;
        }
      }

      setAvailableDepositTokens();
      setAvailableCollateralTokens();
      setAvailableDebtTokens();

      if (
        isDeleverageWithSwappedTokens({
          tradeType: self.tradeType,
          collateral: self.collateral as TokenDefinition | undefined,
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
      } else if (
        // In vault situations, the leverage ratios are set above
        self.collateral?.tokenType === 'nToken' &&
        isLeveragedTrade(self.tradeType)
      ) {
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

      setInitialComputedOptions();

      console.log(
        'trade model afterAttach',
        self.selectedDepositToken,
        self.selectedNetwork,
        self.tradeType
      );
      self.isReady = true;
    };

    const calculate = () => {
      if (!isAlive(self)) return;

      const {
        requiredArgs,
        calculationFn,
        calculateDebtOptions,
        calculateCollateralOptions,
      } = getTradeConfig(self.tradeType);
      let inputsSatisfied = true;

      const inputs = requiredArgs.reduce((acc, arg) => {
        if (arg === 'collateralPool' && isNOTEStake(self.tradeType)) {
          acc['collateralPool'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getSNOTEPool();
        } else if (arg === 'collateralPool') {
          let currencyId: number | undefined;
          if (self.collateral?.currencyId) {
            currencyId = self.collateral.currencyId;
          } else {
            const ids = unique(
              self.availableCollateralTokens?.map((t) => t.currencyId)
            );
            if (ids.length === 1) currencyId = ids[0];
          }

          acc['collateralPool'] = currencyId
            ? root()
                .getNetworkClient(self.selectedNetwork)
                .getNotionalMarket(currencyId)
            : undefined;
        } else if (arg === 'debtPool' && self.debt?.currencyId) {
          let currencyId: number | undefined;
          if (self.debt?.currencyId) {
            currencyId = self.debt.currencyId;
          } else {
            const ids = unique(
              self.availableDebtTokens?.map((t) => t.currencyId)
            );
            if (ids.length === 1) currencyId = ids[0];
          }
          acc['debtPool'] = currencyId
            ? root()
                .getNetworkClient(self.selectedNetwork)
                .getNotionalMarket(currencyId)
            : undefined;
        } else if (arg === 'vaultAdapter' && self.vaultAddress) {
          acc['vaultAdapter'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getVaultAdapter(self.vaultAddress);
        } else if (arg === 'balances') {
          acc['balances'] = root().getAccountDefinition(
            self.selectedNetwork
          )?.balances;
        } else if (arg === 'riskFactorLimit') {
          acc['riskFactorLimit'] = {
            riskFactor: 'leverageRatio',
            limit: self.leverageRatio,
            args: isVaultTrade(self.tradeType)
              ? undefined
              : [self.collateral?.currencyId],
          };
        } else if (arg === 'vaultLastUpdateTime' && self.vaultAddress) {
          const accountDefinition = root().getAccountDefinition(
            self.selectedNetwork
          );

          if (accountDefinition?.vaultLastUpdateTime) {
            acc['vaultLastUpdateTime'] =
              accountDefinition.vaultLastUpdateTime.get(self.vaultAddress);
          } else {
            acc['vaultLastUpdateTime'] = 0;
          }
        } else if (self[arg] === undefined) {
          inputsSatisfied = false;
        } else {
          acc[arg] = self[arg];
        }
        return acc;
      }, {} as Record<CalculationFnParams, unknown>);

      if (inputsSatisfied) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const outputs = calculationFn(inputs as any);
          if (outputs) {
            Object.keys(outputs).forEach((key) => {
              self[key] = outputs[key];
            });
          }

          self.calculationSuccess = true;
          self.calculateError = undefined;
        } catch (e) {
          console.error('trade model calculate error', e);
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

    const calculateStakingWithOptimalETH = (
      setETHInput: (value: string, emitChange: boolean) => void
    ) => {
      calculate();

      if (self.useOptimalETH && self.depositBalance) {
        const account = root().getNetworkAccount(self.selectedNetwork);
        const accountBalances = account?.portfolioRiskProfile?.balances || [];
        const maxETH = accountBalances.find(
          (b) => b.token.id === self.depositBalance?.tokenId
        );

        // Cap the optimal ETH input to the account's balance
        if (maxETH && self.depositBalance.gt(maxETH)) {
          setETHInput(maxETH.toExactString(), false);
          self.depositBalance = maxETH;
        } else {
          // Set the ETH input to the calculated optimal amount
          setETHInput(self.depositBalance.toExactString(), false);
        }
      }
    };

    const setNOTEBalanceForStaking = (
      balance: TokenBalance | undefined,
      setETHInput: (value: string, emitChange: boolean) => void
    ) => {
      if (!isAlive(self)) return;
      self.secondaryDepositBalance = balance;
      calculateStakingWithOptimalETH(setETHInput);
    };

    const setETHBalanceForStaking = (
      balance: TokenBalance | undefined,
      hasTouchedETH: boolean,
      setETHInput: (value: string, emitChange: boolean) => void
    ) => {
      if (!isAlive(self)) return;
      self.useOptimalETH =
        (balance === undefined || balance.isZero()) && !hasTouchedETH;
      self.depositBalance = balance;

      calculateStakingWithOptimalETH(setETHInput);
    };

    const setUseOptimalETHForStaking = (
      useOptimalETH: boolean,
      setETHInput: (value: string, emitChange: boolean) => void
    ) => {
      if (!isAlive(self)) return;
      self.useOptimalETH = useOptimalETH;
      calculateStakingWithOptimalETH(setETHInput);
    };

    const setDepositBalance = (
      balance: TokenBalance | undefined,
      maxWithdraw = false
    ) => {
      if (!isAlive(self)) return;
      self.depositBalance = balance;
      self.maxWithdraw = maxWithdraw;
      calculate();
    };

    const setHasInputErrors = (inputErrors: boolean) => {
      if (!isAlive(self)) return;
      self.inputErrors = inputErrors;
    };

    const setConfirm = (confirm: boolean) => {
      if (!isAlive(self)) return;
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
      const accountBalances = self.vaultAddress
        ? account.balances.filter(
            (b) => b.token.vaultAddress === self.vaultAddress
          )
        : // Using the risk profile here ensures that we use settled balances
          new AccountRiskProfile(account.balances, account.network).balances;

      try {
        const populatedTransaction = yield config.transactionBuilder({
          ...self,
          accountBalances,
          vaultLastUpdateTime: account.vaultLastUpdateTime
            ? new Map<string, number>(account.vaultLastUpdateTime.entries())
            : new Map<string, number>(),
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
        console.error(e);
        const _reason = (e as { reason: string | undefined })['reason'];
        const parsedReason = _reason?.replace(/execution\sreverted:?/, '');
        return {
          populatedTransaction: undefined,
          transactionError: parsedReason
            ? `Transaction will revert: ${parsedReason}`
            : (e as Error).toString(),
        };
      }
    });

    const clearTradeState = () => {
      self.confirm = false;
      self.inputsSatisfied = false;
      self.calculationSuccess = false;
      self.netRealizedCollateralBalance = undefined;
      self.netRealizedDebtBalance = undefined;
      self.depositBalance = undefined;
      self.debtBalance = undefined;
      self.collateralBalance = undefined;
      self.leverageRatio = undefined;
      self.inputErrors = false;
    };

    const setCollateralByID = (
      id: string | undefined,
      clearBalances: boolean
    ) => {
      if (!isAlive(self)) return;
      self.collateral = id
        ? self.availableCollateralTokens?.find((t) => t.id === id)
        : undefined;
      if (clearBalances) {
        self.debtBalance = undefined;
        self.collateralBalance = undefined;
      }
      calculate();
    };

    const setDebtByID = (id: string | undefined, clearBalances: boolean) => {
      if (!isAlive(self)) return;
      self.debt = id
        ? self.availableDebtTokens?.find((t) => t.id === id)
        : undefined;
      if (clearBalances) {
        self.debtBalance = undefined;
        self.collateralBalance = undefined;
      }

      calculate();
    };

    const setVaultDebtByID = (id: string | undefined) => {
      if (!isAlive(self)) return;
      self.debt = id
        ? self.availableDebtTokens?.find((t) => t.id === id)
        : undefined;
      self.collateral = id
        ? self.availableCollateralTokens?.find(
            (t) => t.maturity === self.debt?.maturity
          )
        : undefined;
      calculate();
    };

    const setRequiredSideDrawerState = (
      requiredState: Record<string, unknown>,
      path: string
    ) => {
      if (!isAlive(self)) return;
      const pathname = window.location.pathname;
      const allStateMatches = Object.keys(requiredState)
        // NOTE: this means that required state cannot clear previously set state
        .filter((k) => requiredState[k] !== undefined)
        .every((k) => {
          const s = getComparisonKey(
            k,
            self as unknown as Partial<BaseTradeState>
          );
          const r = getComparisonKey(k, requiredState);
          return s === r;
        });

      if (
        allStateMatches ||
        // Use a "startsWith" here to support potential suffix to the path
        // such as in roll debt
        !pathname.startsWith(path)
      )
        return;

      // If resetting the state, clear the trade state first to avoid any
      // stale state from previous calculations
      clearTradeState();
      Object.keys(requiredState).forEach((k) => {
        if (k === 'debt' && requiredState[k]) {
          const model = root().getNetworkClient(self.selectedNetwork);
          self.debt = model.getTokenByID(
            (requiredState[k] as TokenDefinition).id
          ) as Instance<typeof TokenDefinitionModel>;
        } else if (k === 'collateral' && requiredState[k]) {
          const model = root().getNetworkClient(self.selectedNetwork);
          self.collateral = model.getTokenByID(
            (requiredState[k] as TokenDefinition).id
          ) as Instance<typeof TokenDefinitionModel>;
        }

        self[k] = requiredState[k];
      });
      calculate();
    };

    const setNTokenAdjustedLeverage = (leverageRatio: number) => {
      if (!isAlive(self)) return;
      if (!isFinite(leverageRatio)) return;
      const account = root().getNetworkAccount(self.selectedNetwork);
      const groupedHoldings = account?.groupedHoldings;
      const nTokenPositions = groupedHoldings?.filter(
        ({ asset }) => asset.balance.tokenType === 'nToken'
      );
      const currentPosition = nTokenPositions?.find(
        ({ asset }) =>
          asset.balance.underlying.symbol === self.selectedDepositToken
      );
      if (!currentPosition) return;

      if (leverageRatio >= currentPosition.leverageRatio) {
        self.isDeleverage = false;
        self.collateral = currentPosition.asset.balance.token as Instance<
          typeof TokenDefinitionModel
        >;
        self.debt = currentPosition.debt.balance.token as Instance<
          typeof TokenDefinitionModel
        >;
      } else if (leverageRatio < currentPosition.leverageRatio) {
        self.isDeleverage = true;
        self.collateral = (
          currentPosition.debt.balance.tokenType === 'PrimeDebt'
            ? root()
                .getNetworkClient(self.selectedNetwork)
                .getPrimeCash(currentPosition.debt.balance.currencyId)
            : currentPosition.debt.balance.token
        ) as Instance<typeof TokenDefinitionModel>;
        self.debt = currentPosition.asset.balance.token as Instance<
          typeof TokenDefinitionModel
        >;
      }

      self.collateralBalance = undefined;
      self.debtBalance = undefined;
      self.leverageRatio = leverageRatio;

      calculate();
    };

    const setMaxWithdraw = (
      depositBalance: TokenBalance,
      collateralBalance: TokenBalance | undefined,
      debtBalance: TokenBalance | undefined
    ) => {
      if (!isAlive(self)) return;
      self.maxWithdraw = true;
      self.calculationSuccess = true;
      self.depositBalance = depositBalance;
      self.collateralBalance = collateralBalance;
      self.debtBalance = debtBalance;
      calculate();
    };

    const setVaultMaxWithdraw = () => {
      if (!isAlive(self)) return;
      if (!self.vaultAddress) return;
      const networkAccount = root().getNetworkAccount(self.selectedNetwork);
      const vaultProfile = networkAccount?.vaultHoldings?.find(
        ({ vaultAddress }) => vaultAddress === self.vaultAddress
      );
      const maxWithdrawValues = networkAccount?.maxVaultWithdraw(
        self.vaultAddress
      );

      self.inputsSatisfied = true;
      self.maxWithdraw = true;
      self.calculationSuccess = true;
      self.depositBalance = maxWithdrawValues?.maxWithdrawUnderlying.neg();
      self.collateralBalance = vaultProfile?.vaultShares.neg();
      self.debtBalance = vaultProfile?.vaultDebt.neg();
      self.netRealizedCollateralBalance =
        maxWithdrawValues?.netRealizedCollateralBalance;
      self.netRealizedDebtBalance = maxWithdrawValues?.netRealizedDebtBalance;
      self.debtFee = maxWithdrawValues?.debtFee;
      self.collateralFee = maxWithdrawValues?.collateralFee;
    };

    const setLeverageRatio = (leverageRatio: number) => {
      if (!isAlive(self)) return;
      self.leverageRatio = leverageRatio;
      calculate();
    };

    const setInitialConvertAsset = (initialBalance: TokenBalance) => {
      if (!isAlive(self)) return;
      if (self.tradeType === 'ConvertAsset') {
        self.debt = initialBalance.token as Instance<
          typeof TokenDefinitionModel
        >;
        self.debtBalance = initialBalance;
      } else {
        self.collateral = initialBalance.token as Instance<
          typeof TokenDefinitionModel
        >;
        self.collateralBalance = initialBalance;
      }
      calculate();
    };

    const setCollateralBalance = (
      balance: TokenBalance | undefined,
      maxWithdraw: boolean
    ) => {
      if (!isAlive(self)) return;
      self.collateralBalance = balance;
      self.maxWithdraw = maxWithdraw;
      calculate();
    };

    const setDebtBalance = (
      balance: TokenBalance | undefined,
      maxWithdraw: boolean
    ) => {
      if (!isAlive(self)) return;
      self.debtBalance = balance;
      self.maxWithdraw = maxWithdraw;
      calculate();
    };

    const setDebtAndCollateralBalance = (
      debtBalance: TokenBalance | undefined,
      collateralBalance: TokenBalance | undefined
    ) => {
      if (!isAlive(self)) return;
      self.debtBalance = debtBalance;
      self.collateralBalance = collateralBalance;
      calculate();
    };

    return {
      setCollateralBalance,
      setDebtBalance,
      setDebtAndCollateralBalance,
      setInitialConvertAsset,
      setNTokenAdjustedLeverage,
      setMaxWithdraw,
      setLeverageRatio,
      setRequiredSideDrawerState,
      afterAttach,
      setHasInputErrors,
      setDepositBalance,
      setConfirm,
      buildTransaction,
      clearTradeState,
      setCollateralByID,
      setDebtByID,
      setVaultDebtByID,
      setNOTEBalanceForStaking,
      setETHBalanceForStaking,
      setUseOptimalETHForStaking,
      setVaultMaxWithdraw,
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
        newBalances.length > 0 &&
        !self.vaultAddress
        ? AccountRiskProfile.simulate(account?.balances || [], newBalances)
        : undefined;
    };

    const getPortfolioComparison = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      let postBalances: TokenBalance[] | undefined;
      let priorBalances: TokenBalance[] | undefined;
      if (self.vaultAddress) {
        const { postVaultRisk, priorVaultRisk } = getPostVaultRiskProfile();
        priorBalances = priorVaultRisk?.balances;
        postBalances = postVaultRisk?.balances;
      } else {
        priorBalances = account?.portfolioRiskProfile?.balances;
        postBalances = getPostTradeSummary()?.balances;
      }
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

    const hasSwappedTokens = () => {
      return isDeleverageWithSwappedTokens({
        tradeType: self.tradeType,
        collateral: self.collateral as TokenDefinition | undefined,
      });
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

    const getLeveragedNTokenPositions = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const model = root().getNetworkClient(self.selectedNetwork);
      const groupedHoldings = account?.groupedHoldings;
      if (!groupedHoldings) {
        return {
          isLoading: true,
          currentPosition: undefined,
          depositTokensWithPositions: [] as string[],
          currentHoldings: undefined,
          nTokenPositions: undefined,
        };
      }

      const nTokenPositions = groupedHoldings?.filter(
        ({ asset }) => asset.balance.tokenType === 'nToken'
      );
      const currentPosition = nTokenPositions.find(
        ({ asset }) =>
          asset.balance.underlying.symbol === self.selectedDepositToken
      );
      const depositTokensWithPositions = nTokenPositions.map(
        ({ asset }) => asset.balance.underlying.symbol
      );
      // The difference between currentPosition and currentHoldings is that current holdings
      // has more metadata but it arrives a little later
      const currentHoldings = groupedHoldings.find(
        ({ asset }) =>
          asset.balance.underlying.symbol === self.selectedDepositToken
      );
      const currentAPYFactors = currentHoldings
        ? model.getLeveragedAPY(
            currentHoldings?.asset.balance,
            currentHoldings?.debt.balance,
            currentHoldings?.leverageRatio
          )
        : undefined;

      return {
        isLoading: false,
        currentPosition,
        depositTokensWithPositions,
        currentHoldings,
        nTokenPositions,
        currentAPYFactors,
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
      const vaultAdapter = self.vaultAddress
        ? root()
            .getNetworkClient(self.selectedNetwork)
            .getVaultAdapter(self.vaultAddress)
        : undefined;
      const vaultConfig = self.vaultAddress
        ? root()
            .getNetworkClient(self.selectedNetwork)
            .getVaultConfig(self.vaultAddress)
        : undefined;
      const priorVaultBalances = getPriorVaultBalances();

      if (vaultConfig) {
        const {
          minAccountBorrowSize,
          totalUsedPrimaryBorrowCapacity,
          maxPrimaryBorrowCapacity,
        } = vaultConfig;
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
        vaultTVL: vaultAdapter?.getVaultTVL(),
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
          self.calculationSuccess &&
          !!postAccountRisk &&
          (leverageRatio === null ||
            (!!postAccountRisk.maxLeverageRatio &&
              !!leverageRatio &&
              leverageRatio < postAccountRisk.maxLeverageRatio)) &&
          vaultCapacityError === false &&
          self.inputErrors === false
        );
      } else if (isNOTEStake(self.tradeType)) {
        const account = root().getNetworkAccount(self.selectedNetwork);
        const priorBalances = account?.balances;
        const noteBalance = priorBalances?.find((t) => t.symbol === 'NOTE');
        const ethBalance = priorBalances?.find(
          (t) => t.tokenId === self.deposit?.id
        );
        const hasSufficientNOTE =
          self.secondaryDepositBalance &&
          noteBalance &&
          self.secondaryDepositBalance.lte(noteBalance);
        const hasSufficientETH =
          self.depositBalance &&
          ethBalance &&
          self.depositBalance.lte(ethBalance);

        return (
          self.calculationSuccess &&
          self.inputErrors === false &&
          (self.tradeType === 'StakeNOTE'
            ? hasSufficientETH && hasSufficientNOTE
            : true)
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

    const getLeverageOptions = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const isSwapped = isDeleverageWithSwappedTokens({
        tradeType: self.tradeType,
        collateral: self.collateral as TokenDefinition | undefined,
      });

      if (!self.collateralOptions && !self.collateral)
        return {
          leverageOptions: [],
          selectedLeverageOption: undefined,
        };

      const leverageOptions = self.debtOptions?.map((debt) => {
        // TODO: The collateral balance changes depending on the maturity of the debt, this
        // causes the APY to change when the maturity changes. (only occurs for leveraged liquidity)
        const collateralBalance =
          self.collateralOptions.find((c) => c.token.id === self.collateral?.id)
            ?.balance || TokenBalance.zero(self.collateral as TokenDefinition);

        const isVariableRate =
          debt.token.maturity === PRIME_CASH_VAULT_MATURITY ||
          debt.token.maturity === undefined;

        const debtBalance =
          debt.balance || TokenBalance.zero(debt.token as TokenDefinition);

        try {
          const leveragedAPY = model.getLeveragedAPY(
            collateralBalance,
            debtBalance,
            self.leverageRatio || self.defaultLeverageRatio || 0,
            self.vaultTradeMetadata
          );

          return {
            ...leveragedAPY,
            isVariableRate,
            debt,
            error: debt.error,
          };
        } catch (e) {
          console.error(e);
          return {
            isVariableRate,
            debt,
            error: (e as Error).toString(),
          };
        }
      });

      return {
        leverageOptions,
        selectedLeverageOption: leverageOptions.find(
          (o) =>
            o.debt.token.id ===
            (isSwapped
              ? self.collateral?.tokenType === 'PrimeCash'
                ? model.getPrimeDebt(self.collateral.currencyId).id
                : self.collateral?.id
              : self.debt?.id)
        ),
      };
    };

    const getAPYFactors = () => {
      const model = root().getNetworkClient(self.selectedNetwork);

      try {
        if (
          self.tradeType === 'RollDebt' &&
          self.debtBalance &&
          self.leverageRatio !== undefined
        ) {
          const ntoken = model.getNToken(self.debtBalance.currencyId);
          const debtAPY = self.debtOptions?.find(
            (o) => o.token.id === self.debtBalance?.tokenId
          )?.interestRate;
          return createLeveragedAPYData(
            model.getSpotAPY(ntoken.id),
            debtAPY || 0,
            self.leverageRatio || 0
          );
        } else if (self.tradeType === 'RollVaultPosition' && self.collateral) {
          const debtAPY = self.debtOptions?.find(
            (o) => o.token.id === self.debtBalance?.tokenId
          )?.interestRate;
          return createLeveragedAPYData(
            model.getSpotAPY(self.collateral?.id),
            debtAPY || 0,
            self.leverageRatio || 0
          );
        } else if (
          isDeleverageTrade(self.tradeType) ||
          isLeveragedTrade(self.tradeType)
        ) {
          return getLeverageOptions().selectedLeverageOption;
        } else if (self.collateralBalance) {
          return model.getSimulatedAPY(self.collateralBalance);
        } else if (self.debtBalance) {
          return model.getSimulatedAPY(self.debtBalance);
        } else if (self.collateral) {
          return model.getSpotAPY(self.collateral.id);
        } else if (self.debt) {
          return model.getSpotAPY(self.debt.id);
        } else {
          return undefined;
        }
      } catch (e) {
        console.error(e);
        return undefined;
      }
    };

    const getNetBalances = () => {
      const account = root().getNetworkAccount(self.selectedNetwork);
      const accountBalances = account?.portfolioRiskProfile?.balances || [];
      const netChange =
        self.tradeType === 'RollDebt'
          ? self.debtBalance
          : self.tradeType === 'ConvertAsset'
          ? self.collateralBalance
          : self.collateralBalance || self.debtBalance;
      if (!netChange) return undefined;

      const zero = netChange.copy(0);
      const start =
        accountBalances.find((b) => b.tokenId === netChange.tokenId) || zero;
      const end = start.add(netChange);
      if (start.eq(end) || (start.gte(zero) && end.gte(zero))) {
        // Only asset changes
        return { netAssetBalance: netChange, netDebtBalance: zero };
      } else if (start.lte(zero) && end.lte(zero)) {
        // Only debt changes
        return { netAssetBalance: zero, netDebtBalance: netChange };
      } else if (start.gte(zero) && end.lte(zero)) {
        // Entire start balance has decreased to zero, entire negative balance is created
        return { netAssetBalance: start.neg(), netDebtBalance: end };
      } else if (start.lte(zero) && end.gte(zero)) {
        // Entire start balance has been repaid, entire positive balance is created
        return { netAssetBalance: end, netDebtBalance: start.neg() };
      }

      throw Error('unknown balance change');
    };

    return {
      get vaultName() {
        if (!self.vaultAddress) return undefined;
        const model = root().getNetworkClient(self.selectedNetwork);
        const config = model.getVaultConfig(self.vaultAddress);

        return {
          name: config?.name,
          poolName: config?.poolName,
          technicalName: config?.technicalName,
          boosterProtocol: config?.boosterProtocol,
          baseProtocol: config?.baseProtocol,
        };
      },
      get selectedTokens() {
        return {
          deposit: self.deposit as TokenDefinition,
          debt: self.debt as TokenDefinition,
          collateral: self.collateral as TokenDefinition,
        };
      },
      get availableTokens() {
        return {
          deposit: self.availableDepositTokens as TokenDefinition[] | undefined,
          debt: self.availableDebtTokens as TokenDefinition[] | undefined,
          collateral: self.availableCollateralTokens as
            | TokenDefinition[]
            | undefined,
        };
      },
      get computedOptions() {
        return {
          collateral: self.collateralOptions as TokenOption[] | undefined,
          debt: self.debtOptions as TokenOption[] | undefined,
        };
      },
      getLeveragedNTokenPositions,
      getNetBalances,
      getLeverageOptions,
      getAPYFactors,
      getRiskSummary,
      getVaultRiskSummary,
      getTradeLiquidationPrices,
      getPortfolioComparison,
      getPriorVaultBalances,
      getPostVaultFactors,
      getVaultCapacity,
      getPostTradeIncentives,
      canSubmit,
      hasSwappedTokens,
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
      const {
        collateralBalance,
        netRealizedCollateralBalance,
        vaultTradeMetadata,
      } = calculationFn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        i as any
      ) as {
        collateralFee: TokenBalance;
        collateralBalance: TokenBalance;
        netRealizedCollateralBalance: TokenBalance;
        vaultTradeMetadata?: unknown;
      };

      return {
        token: c as Instance<typeof TokenDefinitionModel>,
        balance: collateralBalance,
        vaultTradeMetadata,
        error: undefined,
        ..._getTradedInterestRate(
          netRealizedCollateralBalance,
          collateralBalance,
          fCashMarket,
          tradeType,
          vaultAdapter,
          model,
          vaultTradeMetadata
        ),
      };
    } catch (e) {
      console.error(e);
      return {
        token: c as Instance<typeof TokenDefinitionModel>,
        balance: undefined,
        vaultTradeMetadata: undefined,
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
  return (
    options
      // Sorts debt options so that the variable rate option is first
      .sort(sortByMaturity)
      .map((d) => {
        const i = { ...inputs, debt: d };
        try {
          if (isVaultTrade(tradeType)) {
            // Switch to the matching vault share token for vault trades
            if (!d.vaultAddress || !d.maturity)
              throw Error('Invalid debt token');
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
              model,
              undefined // No vault trade metadata for debt
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
      })
  );
}

function _getTradedInterestRate(
  realized: TokenBalance,
  _amount: TokenBalance,
  fCashMarket: fCashMarket | undefined,
  tradeType: AllTradeTypes | NOTETradeType | undefined,
  vaultAdapter: VaultAdapter | undefined,
  model: NetworkClientModelType,
  vaultTradeMetadata: unknown | undefined
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
        _amount.vaultAddress
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
    const amountInSy =
      // If the borrow is NOT the same as the asset then use the tokens in sy to mark the
      // realized amount so that the interest rate does not include any exchange rate deviations
      // from the borrowed asset to the PT accounting asset.
      !(vaultAdapter as PendlePT).isBorrowSameAsAsset && vaultTradeMetadata
        ? (vaultTradeMetadata as { tokensInSy: TokenBalance }).tokensInSy
        : realized;
    const impliedExchangeRate = amount.toFloat() / amountInSy.toFloat();
    const timeToMaturity = (vaultAdapter as PendlePT).timeToExpiry;
    interestRate = Math.trunc(
      ((Math.log(impliedExchangeRate) * SECONDS_IN_YEAR_ACTUAL) /
        timeToMaturity) *
        RATE_PRECISION
    );
  } else if (amount.tokenType === 'VaultShare' && vaultAdapter) {
    // In other cases, just use the spot APY
    return {
      interestRate: vaultAdapter.getVaultAPY(),
      utilization: undefined,
    };
  }

  return {
    interestRate:
      interestRate !== undefined
        ? (interestRate * 100) / RATE_PRECISION
        : undefined,
    utilization,
  };
}

/** Sorts tokens so that variable rate (undefined/PRIME_CASH_VAULT_MATURITY) options appear first */
function sortByMaturity<T extends { maturity?: number }>(a: T, b: T) {
  return (
    (a.maturity === undefined || a.maturity === PRIME_CASH_VAULT_MATURITY
      ? 0
      : a.maturity) -
    (b.maturity === undefined || b.maturity === PRIME_CASH_VAULT_MATURITY
      ? 0
      : b.maturity)
  );
}
