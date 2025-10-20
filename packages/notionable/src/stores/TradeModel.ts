import {
  AccountDefinition,
  APYData,
  NotionalTypes,
  PendlePT,
  SingleSidedLP,
  TokenBalance,
  TokenDefinition,
  TokenDefinitionModel,
  VAULT_TYPES,
  VaultAdapter,
  VaultTradeMetadata,
  VaultType,
} from '@notional-finance/core-entities';
import {
  AllTradeTypes,
  isNOTEStake,
  isVaultTrade,
  NOTETradeType,
  TokenOption,
  getTradeConfig,
} from '../base-trade/base-trade-store';
import {
  flow,
  getParent,
  getRoot,
  getSnapshot,
  getType,
  Instance,
  isAlive,
  types,
} from 'mobx-state-tree';
import { NetworkClientModelType, RootStoreInterface } from './root-store';
import {
  DEX_ID,
  formatNumberAsPercent,
  getNowSeconds,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
} from '@notional-finance/util';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import {
  CalculationFn,
  CalculationFnParams,
} from '@notional-finance/transaction';

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
    return model.getTokenByID(identifier.toString().toLowerCase()) as Instance<
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
      'StakeNOTECoolDown',
      'StakeNOTERedeem',
      'StakeNOTE',
      'CreateVaultPosition',
      'IncreaseVaultPosition',
      'AdjustVaultLeverage',
      'RollVaultPosition',
      'WithdrawVault',
      'ManageVault',
      'InitiateWithdraw',
      'FinalizeWithdraw',
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
    /** This is set to true if the account is a contract */
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
    simulatedWithdraws: types.maybe(
      types.array(
        types.model({
          estimatedWithdrawTime: types.maybe(types.number),
          yieldTokensRedeemed: NotionalTypes.TokenBalance,
          withdrawTokensToReceive: NotionalTypes.TokenBalance,
        })
      )
    ),

    /** Calculated updates to the account balances post trade */
    postTradeBalances: types.optional(
      types.array(NotionalTypes.TokenBalance),
      []
    ),

    /** Amount of ETH redeemed during NOTE unstaking */
    ethRedeem: types.maybe(NotionalTypes.TokenBalance),
    /** True if the optimal ETH amount should be used for NOTE staking */
    useOptimalETH: types.optional(types.boolean, false),

    vaultTradeMetadata: types.optional(
      types.array(
        types.model({
          tokensSold: NotionalTypes.TokenBalance,
          tokensBought: NotionalTypes.TokenBalance,
          exchangeRate: types.number,
          differenceFromSpot: types.number,
          dexId: types.number,
          minPurchaseAmount: types.maybe(NotionalTypes.TokenBalance),
          exchangeData: types.maybe(types.string),
          isEstimated: types.boolean,
        })
      ),
      []
    ),
    /** True if the trade is a deleverage */
    isDeleverage: types.optional(types.boolean, false),

    /** Vault type */
    strategyType: types.optional(
      types.maybe(types.enumeration('VaultType', VAULT_TYPES)),
      undefined
    ),
  })
  .actions((self) => {
    const root = () => getRoot<RootStoreInterface>(self);

    const getDefaultTokens = (
      availableTokens: TokenDefinition[],
      tradeType?: AllTradeTypes
    ) => {
      if (tradeType === 'CreateVaultPosition') {
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
        return getDefaultTokens(availableTokens, tradeType);
      } else {
        return availableTokens.find((t) => t.id === selectedToken);
      }
    };

    const setAvailableDebtTokens = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const account = root().getAccountDefinition(self.selectedNetwork);
      const { debtFilter } = getTradeConfig(self.tradeType);
      const listedTokens = model.getAllTokens();

      const availableDebtTokens = listedTokens
        .filter(
          (t) =>
            t.tokenType === 'VaultDebt' &&
            (t.maturity ? t.maturity > getNowSeconds() : true)
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
                    ? {
                        vaultAddress: self.vaultAddress,
                        depositTokenId: model.getVaultConfig(self.vaultAddress)
                          ?.depositToken.id,
                      }
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

    const setInitialLeverageRatios = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      const account = root().getAccountDefinition(self.selectedNetwork);
      const riskProfile =
        account && self.vaultAddress
          ? VaultAccountRiskProfile.fromAccount(self.vaultAddress, account)
          : undefined;

      if (self.availableDebtTokens.length === 1) {
        self.debt = self.availableDebtTokens[0];
        const l = model.getLeverageRatios(self.debt as TokenDefinition);
        self.maxLeverageRatio = l.maxLeverageRatio;
        self.defaultLeverageRatio = l.defaultLeverageRatio;
        self.minLeverageRatio = l.minLeverageRatio;
        self.leverageRatio = self.defaultLeverageRatio;
      }

      if (riskProfile) {
        // If there is an existing risk profile, use the leverage ratio from the risk profile
        self.leverageRatio = riskProfile.leverageRatio();
        self.defaultLeverageRatio = self.leverageRatio;
      }
    };

    const setInitialComputedOptions = () => {
      const model = root().getNetworkClient(self.selectedNetwork);

      if (self.tradeType === 'CreateVaultPosition') {
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
      } else if (
        isNOTEStake(self.tradeType) ||
        self.tradeType === 'InitiateWithdraw'
      ) {
        calculate();
      }
    };

    const afterAttach = () => {
      const model = root().getNetworkClient(self.selectedNetwork);
      if (self.vaultAddress) {
        const config = model.getVaultConfig(self.vaultAddress);
        self.strategyType = config.strategyType as VaultType;
        self.deposit = config.depositToken;
        self.availableDepositTokens.replace([self.deposit]);
        self.availableCollateralTokens.replace([config.vaultToken]);
        self.collateral = config.vaultToken;

        if (self.tradeType === 'AdjustVaultLeverage') {
          self.depositBalance = TokenBalance.zero(
            config.depositToken as TokenDefinition
          );
        }
      } else if (isNOTEStake(self.tradeType)) {
        // Set deposit token
        self.deposit = self.selectedDepositToken
          ? (model.getTokenBySymbol(self.selectedDepositToken) as Instance<
              typeof TokenDefinitionModel
            >)
          : undefined;

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

      setAvailableDebtTokens();
      setInitialLeverageRatios();

      // NOTE: everything above here is just setting the initial state including leverage
      // ratios and the available tokens
      // This sets the initial borrow apy for the debt options
      setInitialComputedOptions();

      self.redeemToWETH =
        root().getNetworkAccount(self.selectedNetwork)?.isContract || false;

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
        } else if (arg === 'vaultAdapter' && self.vaultAddress) {
          acc['vaultAdapter'] = root()
            .getNetworkClient(self.selectedNetwork)
            .getVaultAdapter(self.vaultAddress);
        } else if (arg === 'balances') {
          acc['balances'] = root().getAccountDefinition(
            self.selectedNetwork
          )?.balances;
        } else if (arg === 'withdrawRequests' && self.vaultAddress) {
          acc['withdrawRequests'] = root()
            .getAccountDefinition(self.selectedNetwork)
            ?.withdrawRequests?.get(self.vaultAddress);
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
              if (key === 'vaultTradeMetadata') {
                self.vaultTradeMetadata.replace(outputs[key]);
              } else {
                self[key] = outputs[key];
              }
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
            if (arg === 'deposit') {
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
          .every((r) => inputs[r] !== undefined)
      ) {
        self.debtOptions.replace(
          computeDebtOptions(
            inputs,
            calculationFn,
            self.availableDebtTokens as TokenDefinition[],
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
        const accountBalances = account?.balances || [];
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
        : [];

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

      if (self.debt) {
        const model = root().getNetworkClient(self.selectedNetwork);
        const l = model.getLeverageRatios(self.debt as TokenDefinition);
        self.maxLeverageRatio = l.maxLeverageRatio;
        self.defaultLeverageRatio = l.defaultLeverageRatio;
        self.minLeverageRatio = l.minLeverageRatio;
      }

      calculate();
    };

    const setVaultMaxWithdraw = () => {
      if (!isAlive(self)) return;
      if (!self.vaultAddress) return;
      const account = root().getAccountDefinition(self.selectedNetwork);
      const priorVaultRisk =
        account && self.vaultAddress
          ? VaultAccountRiskProfile.fromAccount(
              self.vaultAddress,
              account as AccountDefinition
            )
          : undefined;
      const maxWithdrawValues = priorVaultRisk?.maxWithdraw();

      self.inputsSatisfied = true;
      self.maxWithdraw = true;
      self.calculationSuccess = true;
      self.depositBalance = maxWithdrawValues?.maxWithdrawUnderlying.neg();
      self.collateralBalance = priorVaultRisk?.vaultShares.neg();
      self.debtBalance = priorVaultRisk?.vaultDebt.neg();
      self.netRealizedCollateralBalance =
        maxWithdrawValues?.netRealizedCollateralBalance;
      self.netRealizedDebtBalance = maxWithdrawValues?.netRealizedDebtBalance;
      self.debtFee = maxWithdrawValues?.debtFee;
      self.collateralFee = maxWithdrawValues?.collateralFee;
      self.vaultTradeMetadata.replace(
        (maxWithdrawValues?.vaultTradeMetadata || []) as any
      );
    };

    const setLeverageRatio = (leverageRatio: number) => {
      if (!isAlive(self)) return;
      self.leverageRatio = leverageRatio;
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
      setLeverageRatio,
      afterAttach,
      setHasInputErrors,
      setDepositBalance,
      setConfirm,
      buildTransaction,
      clearTradeState,
      setCollateralByID,
      setDebtByID,
      setNOTEBalanceForStaking,
      setETHBalanceForStaking,
      setUseOptimalETHForStaking,
      setVaultMaxWithdraw,
    };
  })
  .views((self) => {
    const root = () => getRoot<RootStoreInterface>(self);

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
                0,
                account?.withdrawRequests?.[self.vaultAddress]
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
      const { priorVaultRisk, postVaultRisk } = getPostVaultRiskProfile();

      return {
        current: {
          healthFactor: priorVaultRisk?.healthFactor(),
          leverageRatio: priorVaultRisk?.leverageRatio(),
          netWorth: priorVaultRisk?.netWorth(),
          liquidationPrices: priorVaultRisk?.getAllLiquidationPrices() || [],
        },
        updated: postVaultRisk
          ? {
              healthFactor: postVaultRisk?.healthFactor(),
              leverageRatio: postVaultRisk?.leverageRatio(),
              netWorth: postVaultRisk?.netWorth(),
              liquidationPrices: postVaultRisk?.getAllLiquidationPrices() || [],
            }
          : undefined,
      };
    };

    const getVaultAPYBreakdown = () => {
      const { priorVaultRisk, postVaultRisk } = getPostVaultRiskProfile();
      const account = root().getNetworkAccount(self.selectedNetwork);
      const model = root().getNetworkClient(self.selectedNetwork);
      const holdings = account?.vaultHoldings?.find(
        ({ vaultAddress }) => vaultAddress === self.vaultAddress
      );
      const currentAPY = holdings?.apyData
        ? getSnapshot(holdings?.apyData)
        : undefined;
      const updatedAPY = postVaultRisk
        ? model.getLeveragedAPY(
            postVaultRisk.vaultShares,
            postVaultRisk.vaultDebt,
            postVaultRisk.leverageRatio() || 0,
            self.vaultTradeMetadata
          )
        : undefined;

      return {
        leveragedAPY: (updatedAPY || currentAPY || undefined) as
          | APYData
          | undefined,
        assets: postVaultRisk?.totalAssets() || priorVaultRisk?.totalAssets(),
        debts: postVaultRisk?.totalDebt() || priorVaultRisk?.totalDebt(),
        netWorth: postVaultRisk?.netWorth() || priorVaultRisk?.netWorth(),
      };
    };

    const getVaultCapacity = () => {
      let totalPoolCapacityRemaining: TokenBalance | undefined;
      let overPoolCapacityError = false;
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

      if (vaultConfig) {
        // If the debt balance is the same as the current debt then
        // sum them together, otherwise just go with the new debt balance
        overPoolCapacityError =
          vaultAdapter?.strategyType === 'CurveConvex2Token'
            ? (vaultAdapter as SingleSidedLP).isOverMaxPoolShare(
                self.collateralBalance
              ) ?? false
            : false;

        if (vaultAdapter?.strategyType === 'CurveConvex2Token') {
          totalPoolCapacityRemaining = (
            vaultAdapter as SingleSidedLP
          ).getRemainingPoolCapacity();
          maxPoolShare = (vaultAdapter as SingleSidedLP).maxPoolShares
            ? formatNumberAsPercent(
                (vaultAdapter as SingleSidedLP).getMaxPoolShare(),
                0
              )
            : undefined;
        }
      }

      return {
        overPoolCapacityError:
          self.tradeType === 'WithdrawVault' ? false : overPoolCapacityError,
        maxPoolShare,
        totalPoolCapacityRemaining,
        vaultTVL: vaultAdapter?.getVaultTVL(),
      };
    };

    const canSubmit = () => {
      if (self.vaultAddress) {
        const postAccountRisk = getPostVaultRiskProfile().postVaultRisk;
        const leverageRatio = postAccountRisk?.leverageRatio();
        const { overPoolCapacityError } = getVaultCapacity();
        const hasPostAccountRisk = !!postAccountRisk;
        const isLeverageRatioValid =
          postAccountRisk?.maxLeverageRatio !== undefined &&
          leverageRatio !== undefined &&
          leverageRatio < postAccountRisk.maxLeverageRatio;

        return (
          self.calculationSuccess &&
          hasPostAccountRisk &&
          isLeverageRatioValid &&
          overPoolCapacityError === false &&
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
        throw Error('Not implemented');
      }
    };

    const getVaultMaxWithdraw = () => {
      const { priorVaultRisk } = getPostVaultRiskProfile();
      return priorVaultRisk?.maxWithdraw();
    };

    const getVaultInitiateWithdraw = () => {
      return self.simulatedWithdraws;
    };

    return {
      get vaultName() {
        if (!self.vaultAddress) return undefined;
        const model = root().getNetworkClient(self.selectedNetwork);
        const config = model.getVaultConfig(self.vaultAddress);

        return {
          name: config?.name,
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
      getVaultRiskSummary,
      getPriorVaultBalances,
      getPostVaultFactors,
      getVaultCapacity,
      getVaultAPYBreakdown,
      getVaultMaxWithdraw,
      getVaultInitiateWithdraw,
      canSubmit,
    };
  });

// function averageFixedRate(
//   prior: VaultAccountRiskProfile | undefined,
//   post: VaultAccountRiskProfile | undefined,
//   newBorrowRate: number | undefined
// ) {
//   if (
//     prior?.maturity === post?.maturity &&
//     newBorrowRate !== undefined &&
//     prior?.lastImpliedFixedRate !== undefined &&
//     post?.vaultDebt !== undefined
//   ) {
//     return (
//       (prior.lastImpliedFixedRate * prior.vaultDebt.toFloat() +
//         (newBorrowRate - prior.lastImpliedFixedRate) *
//           post.vaultDebt.toFloat()) /
//       prior.vaultDebt.toFloat()
//     );
//   } else {
//     return newBorrowRate;
//   }
// }

function computeCollateralOptions(
  inputs: Record<CalculationFnParams, unknown>,
  calculationFn: CalculationFn,
  options: TokenDefinition[],
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
        vaultTradeMetadata?: VaultTradeMetadata[];
      };

      return {
        token: c as Instance<typeof TokenDefinitionModel>,
        balance: collateralBalance,
        vaultTradeMetadata,
        error: undefined,
        ..._getTradedInterestRate(
          netRealizedCollateralBalance,
          collateralBalance,
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
            if (!d.vaultAddress) throw Error('Invalid debt token');
            i['collateral'] = model.getVaultShare(d.vaultAddress);
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
  amount: TokenBalance,
  tradeType: AllTradeTypes | NOTETradeType | undefined,
  vaultAdapter: VaultAdapter | undefined,
  model: NetworkClientModelType,
  vaultTradeMetadata: VaultTradeMetadata[] | undefined
): {
  interestRate: number | undefined;
  utilization: number | undefined;
} {
  let interestRate: number | undefined;
  let utilization: number | undefined;
  if (amount.tokenType === 'VaultDebt') {
    const market = model.getLendingMarketFromVaultDebt(amount.token);
    // If borrowing and withdrawing then it is just prime debt increase. This
    // includes vault debt
    utilization = market.getUtilizationPercent(undefined, amount.neg());
    interestRate = market.getInterestRate(
      market.getUtilization(undefined, amount.neg())
    );
    return {
      utilization,
      interestRate,
    };
  } else if (
    amount.tokenType === 'VaultShare' &&
    vaultAdapter &&
    vaultAdapter.strategyType === 'PendlePT' &&
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
        ? vaultTradeMetadata.find((t) => t.dexId === DEX_ID.PENDLE)
            ?.tokensSold || realized
        : realized;
    const impliedExchangeRate = amount.toFloat() / amountInSy.toFloat();
    const timeToMaturity = (vaultAdapter as PendlePT).timeToExpiry;
    interestRate = Math.trunc(
      RATE_PRECISION *
        (Math.pow(
          impliedExchangeRate,
          SECONDS_IN_YEAR_ACTUAL / timeToMaturity
        ) -
          1)
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
