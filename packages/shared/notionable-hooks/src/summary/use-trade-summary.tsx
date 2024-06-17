import { Theme, useTheme } from '@mui/material';
import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import {
  VaultTradeState,
  TradeState,
  isLeveragedTrade,
  isDeleverageTrade,
  isDeleverageWithSwappedTokens,
  isVaultTrade,
  AllTradeTypes,
  NOTETradeState,
} from '@notional-finance/notionable';
import { BASIS_POINT } from '@notional-finance/util';
import {
  IntlShape,
  useIntl,
  MessageDescriptor,
  defineMessage,
  defineMessages,
} from 'react-intl';
import { DetailItem, OrderDetailLabels, TradeSummaryLabels, Earnings } from '.';
import { exchangeToLocalPrime } from '@notional-finance/transaction';
import { useTotalAPY } from './use-total-apy';
import { NotionalTheme } from '@notional-finance/styles';

type FeeMessages = {
  content: MessageDescriptor;
  toolTipContent?: MessageDescriptor;
};

function calculate30dEarnings(
  value: TokenBalance | undefined,
  apy: number | undefined
) {
  if (value === undefined || apy === undefined) return undefined;
  const u = value.toUnderlying();
  return u
    .mulInRatePrecision(Math.floor(1e9 + (apy * 1e9) / (100 * 12)))
    .sub(u);
}

function getTotalWalletItem(
  depositBalance: TokenBalance,
  intl: IntlShape
): DetailItem {
  // Label is Total to Wallet or Total from Wallet
  return {
    label: intl.formatMessage(
      depositBalance.isNegative()
        ? OrderDetailLabels.amountToWallet
        : OrderDetailLabels.depositFromWallet
    ),
    value: {
      data: [
        {
          displayValue: depositBalance
            .abs()
            .toUnderlying()
            .toDisplayStringWithSymbol(4, true, false),
          isNegative: false,
        },
      ],
    },
  };
}

function getTradeDetail(
  b: TokenBalance,
  assetOrDebt: 'Asset' | 'Debt',
  typeKey: 'deposit' | 'withdraw' | 'none' | 'repay',
  intl: IntlShape,
  _token?: TokenDefinition,
  underlyingValueOverride?: TokenBalance
) {
  const tokenType = _token?.tokenType || b.unwrapVaultToken().tokenType;
  const caption = formatTokenType(
    _token || b.unwrapVaultToken().token
  )?.caption;

  if (tokenType === 'fCash') {
    return {
      label: intl.formatMessage(
        TradeSummaryLabels[assetOrDebt === 'Asset' ? 'fCashLend' : 'fCashDebt'][
          typeKey
        ],
        { caption }
      ),
      value: {
        data: [
          {
            displayValue: (underlyingValueOverride || b)
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
            showPositiveAsGreen: b.toUnderlying().isPositive(),
            isNegative: false,
          },
        ],
      },
    };
  } else if (tokenType === 'PrimeCash') {
    // net asset balances should always be returned in prime cash
    return {
      label: intl.formatMessage(
        TradeSummaryLabels[assetOrDebt === 'Asset' ? 'PrimeCash' : 'PrimeDebt'][
          typeKey
        ]
      ),
      value: {
        data: [
          {
            displayValue: (underlyingValueOverride || b)
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
            showPositiveAsGreen: b.toUnderlying().isPositive(),
            isNegative: false,
          },
        ],
      },
    };
  } else if (tokenType === 'PrimeDebt') {
    // This is for prime cash vault maturities
    return {
      label: intl.formatMessage(TradeSummaryLabels['PrimeDebt'][typeKey]),
      value: {
        data: [
          {
            displayValue: (underlyingValueOverride || b)
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
            showPositiveAsGreen: b.toUnderlying().isPositive(),
            isNegative: false,
          },
        ],
      },
    };
  } else if (tokenType === 'VaultShare' || tokenType === 'nToken') {
    return {
      label: intl.formatMessage(TradeSummaryLabels[tokenType][typeKey], {
        caption,
      }),
      value: {
        data: [
          {
            displayValue: (underlyingValueOverride || b)
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
            showPositiveAsGreen: b.toUnderlying().isPositive(),
            isNegative: false,
          },
        ],
      },
    };
  } else if (tokenType === 'Underlying' || tokenType === 'NOTE') {
    return {
      label: intl.formatMessage(TradeSummaryLabels['Underlying'][typeKey], {
        symbol: b.symbol,
      }),
      value: {
        data: [
          {
            displayValue: (
              underlyingValueOverride || b
            ).toDisplayStringWithSymbol(4, true, false),
            showPositiveAsGreen: b.isPositive(),
            isNegative: false,
          },
        ],
      },
    };
  }

  throw Error('invalid asset key');
}

function getFeeItems(
  underlying: TokenDefinition,
  isLeverageOrRoll: boolean,
  depositBalance: TokenBalance | undefined,
  collateralBalance: TokenBalance | undefined,
  debtBalance: TokenBalance | undefined,
  collateralFee: TokenBalance | undefined,
  debtFee: TokenBalance | undefined,
  tradeType: AllTradeTypes | undefined,
  theme: NotionalTheme
): DetailItem[] {
  const zeroUnderlying = TokenBalance.zero(underlying);

  if (tradeType === 'StakeNOTE' && collateralFee) {
    return [
      getCollateralFeeDetailItem(
        collateralBalance,
        collateralFee,
        tradeType,
        theme
      ),
    ];
  } else if (tradeType === 'StakeNOTERedeem') {
    // No fees, redemption is proportional
    return [];
  } else if (isLeverageOrRoll) {
    const feeItems: DetailItem[] = [];
    // On leverage or roll trades, don't show prime fee balances since there will
    // never be any

    if (
      debtBalance?.unwrapVaultToken().tokenType !== 'PrimeCash' &&
      debtBalance?.unwrapVaultToken().tokenType !== 'PrimeDebt'
    ) {
      feeItems.push(
        getDebtFeeDetailItem(
          debtBalance,
          debtFee || zeroUnderlying,
          tradeType,
          theme
        )
      );
    }

    if (
      collateralBalance?.unwrapVaultToken().tokenType !== 'PrimeCash' &&
      collateralBalance?.unwrapVaultToken().tokenType !== 'PrimeDebt'
    ) {
      feeItems.push(
        getCollateralFeeDetailItem(
          collateralBalance,
          collateralFee || zeroUnderlying,
          tradeType,
          theme
        )
      );
    }

    return feeItems;
  } else if (
    collateralBalance &&
    depositBalance &&
    // NOTE: Deposit balances are emitted prior to collateral balances here and
    // so it causes the fee value to "toggle" a bit as the value changes. Ideally
    // we move the calculations into the observable so this is hidden
    collateralBalance.currencyId === depositBalance.currencyId
  ) {
    return [
      getCollateralFeeDetailItem(
        collateralBalance,
        collateralFee || zeroUnderlying,
        tradeType,
        theme
      ),
    ];
  } else if (
    debtBalance &&
    depositBalance &&
    debtBalance.currencyId === depositBalance.currencyId
  ) {
    return [
      getCollateralFeeDetailItem(
        debtBalance,
        debtFee || zeroUnderlying,
        tradeType,
        theme
      ),
    ];
  } else {
    return [];
  }
}

function getDebtFeeDetailItem(
  debtBalance: TokenBalance | undefined,
  debtFee: TokenBalance,
  tradeType: AllTradeTypes | undefined,
  theme: Theme
): DetailItem {
  let feeToolTip: FeeMessages | undefined;
  const showPositiveAsGreen = undefined;
  let iconColor: string | undefined = undefined;

  if (debtBalance?.tokenType === 'nToken' && debtFee) {
    const feePercent = debtFee
      .toUnderlying()
      .ratioWith(debtBalance.toUnderlying())
      .abs()
      .toNumber();

    if (
      (isDeleverageTrade(tradeType) && feePercent > 50 * BASIS_POINT) ||
      (!isDeleverageTrade(tradeType) && feePercent > 20 * BASIS_POINT)
    ) {
      iconColor = theme.palette.warning.main;
      feeToolTip = defineMessages({
        content: { defaultMessage: 'Redemption Cost' },
        toolTipContent: {
          defaultMessage:
            'High fixed rate utilization is causing high redemption cost. This will decrease if more liquidity is provided, if fixed rates come down, or gradually over time as fixed rate loans mature.',
        },
      });
    }
  } else if (
    isLeveragedTrade(tradeType) &&
    debtBalance?.unwrapVaultToken()?.tokenType === 'fCash'
  ) {
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Borrow Fee' },
      toolTipContent: {
        defaultMessage:
          'Fees for fixed rate borrowing are paid up front. Fixed rate borrowing also incurs early exit costs.',
      },
    });
  } else if (
    (isDeleverageTrade(tradeType) || tradeType === 'ConvertAsset') &&
    debtBalance?.unwrapVaultToken()?.tokenType === 'fCash'
  ) {
    // In these cases the debt token is the token that is being sold, so we consider
    // it an exit fee
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Fixed Lend Exit Fee' },
    });
  } else if (
    tradeType === 'RollDebt' &&
    debtBalance?.unwrapVaultToken()?.tokenType === 'fCash'
  ) {
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Fixed Borrow Entry Fee' },
    });
  }

  return {
    label: {
      text: feeToolTip
        ? feeToolTip
        : defineMessages({
            content: { defaultMessage: 'Fees' },
          }),
      iconColor,
    },
    value: {
      data: [
        {
          displayValue: debtFee
            .toUnderlying()
            .toDisplayStringWithSymbol(4, true, false),
          isNegative: false,
          showPositiveAsGreen,
        },
      ],
    },
  };
}

function getCollateralFeeDetailItem(
  collateralBalance: TokenBalance | undefined,
  collateralFee: TokenBalance,
  tradeType: AllTradeTypes | undefined,
  theme: Theme
): DetailItem {
  let feeToolTip: FeeMessages | undefined;
  let showPositiveAsGreen: boolean | undefined = undefined;
  let iconColor: string | undefined = undefined;

  if (collateralBalance?.tokenType === 'nToken' && collateralFee.isNegative()) {
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Liquidity Mint Bonus' },
      toolTipContent: {
        defaultMessage:
          'Minting nTokens at high utilization results in a small bonus due to an increase in the nToken valuation.',
      },
    });
    showPositiveAsGreen = true;
  } else if (
    collateralBalance?.tokenType === 'nToken' &&
    collateralFee.isPositive()
  ) {
    const feePercent = collateralFee
      .toUnderlying()
      .ratioWith(collateralBalance.toUnderlying())
      .abs()
      .toNumber();

    if (
      (isLeveragedTrade(tradeType) && feePercent > 50 * BASIS_POINT) ||
      (!isLeveragedTrade(tradeType) && feePercent > 10 * BASIS_POINT)
    ) {
      iconColor = theme.palette.warning.main;
      feeToolTip = defineMessages({
        content: { defaultMessage: 'Fees' },
        toolTipContent: {
          defaultMessage:
            'Fixed rate volatility is causing a larger than normal minting fee. This fee goes to zero as fixed rates stabilize.',
        },
      });
    } else {
      feeToolTip = defineMessages({
        content: { defaultMessage: 'Provide Liquidity Fee' },
      });
    }
  } else if (collateralBalance?.tokenType === 'VaultShare') {
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Trading Cost' },
      toolTipContent: {
        defaultMessage:
          'Trading costs associated with entering a vault position',
      },
    });
  } else if (
    (isDeleverageTrade(tradeType) || tradeType === 'ConvertAsset') &&
    collateralBalance?.unwrapVaultToken()?.tokenType === 'fCash'
  ) {
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Fixed Lend Entry Fee' },
    });
  } else if (
    tradeType === 'RollDebt' &&
    collateralBalance?.unwrapVaultToken()?.tokenType === 'fCash'
  ) {
    // In these cases the collateral token is the debt that is being repaid, so we consider
    // it an exit fee
    feeToolTip = defineMessages({
      content: { defaultMessage: 'Fixed Borrow Exit Fee' },
    });
  }

  return {
    label: {
      text: feeToolTip
        ? feeToolTip
        : defineMessages({
            content: { defaultMessage: 'Fees' },
          }),
      iconColor,
    },
    value: {
      data: [
        {
          displayValue: collateralFee
            .toUnderlying()
            .toDisplayStringWithSymbol(4, true, false),
          isNegative: false,
          showPositiveAsGreen,
        },
      ],
    },
  };
}

function getDepositSummary(
  state: TradeState | VaultTradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  const { netAssetBalance, netRealizedCollateralBalance, tradeType } = state;

  if (netAssetBalance?.isZero() === false && netRealizedCollateralBalance) {
    if (tradeType === 'RepayDebt') {
      summary.push(
        getTradeDetail(
          netRealizedCollateralBalance,
          'Debt',
          'repay',
          intl,
          netAssetBalance.token
        )
      );
    } else {
      summary.push(
        getTradeDetail(
          netRealizedCollateralBalance,
          'Asset',
          'none',
          intl,
          netAssetBalance.token
        )
      );
    }
  }

  return summary;
}

function getWithdrawSummary(
  state: TradeState | VaultTradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  const { netDebtBalance, netAssetBalance, netRealizedDebtBalance, tradeType } =
    state;

  if (netAssetBalance?.isNegative() && netRealizedDebtBalance) {
    summary.push(
      getTradeDetail(
        netRealizedDebtBalance.abs(),
        'Asset',
        'withdraw',
        intl,
        netAssetBalance.token
      )
    );
  } else if (netDebtBalance?.isZero() === false && netRealizedDebtBalance) {
    if (netDebtBalance.tokenType === 'PrimeDebt' && tradeType === 'Withdraw') {
      summary.push(
        getTradeDetail(
          netRealizedDebtBalance.abs(),
          'Asset',
          'withdraw',
          intl,
          netDebtBalance.toPrimeCash().token
        )
      );
    } else {
      summary.push(
        getTradeDetail(
          netRealizedDebtBalance.abs(),
          'Debt',
          netDebtBalance.isNegative() ? 'withdraw' : 'deposit',
          intl,
          netDebtBalance.token
        )
      );
    }
  }

  return summary;
}

function getStakeNOTESummary(
  state: NOTETradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  if (state.tradeType === 'StakeNOTE' && state.collateralBalance) {
    // Mint sNOTE (this gets shifted to the total row)
    if (state.collateralBalance) {
      summary.push(
        getTradeDetail(state.collateralBalance, 'Asset', 'none', intl)
      );
    }

    // Deposit ETH
    if (state.depositBalance) {
      summary.push(
        getTradeDetail(state.depositBalance, 'Asset', 'deposit', intl)
      );
    }

    // Deposit NOTE
    if (state.secondaryDepositBalance) {
      summary.push(
        getTradeDetail(state.secondaryDepositBalance, 'Asset', 'deposit', intl)
      );
    }
  } else if (
    state.tradeType === 'StakeNOTERedeem' &&
    state.collateralBalance &&
    state.ethRedeem
  ) {
    // Redeem sNOTE
    summary.push(getTradeDetail(state.ethRedeem, 'Asset', 'withdraw', intl));
    // Withdraw NOTE
    summary.push(
      getTradeDetail(state.collateralBalance, 'Asset', 'withdraw', intl)
    );
  }

  return summary;
}

/**
 * On entry to a vault this shows three line items:
 *   - deposit and mint
 *   - borrow
 *   - mint rest of the position
 */
function getLeverageSummary(
  state: TradeState | VaultTradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  const {
    depositBalance,
    collateralBalance,
    debtBalance,
    netRealizedCollateralBalance,
    netRealizedDebtBalance,
    debtFee,
    tradeType,
  } = state;

  // This is the entry deposit, will show "Deposit and Mint Asset"
  if (depositBalance?.isPositive() && collateralBalance) {
    summary.push(
      getTradeDetail(
        depositBalance,
        'Asset',
        'deposit',
        intl,
        collateralBalance.token
      )
    );
  }

  if (debtBalance && netRealizedDebtBalance && debtFee) {
    summary.push(
      getTradeDetail(
        netRealizedDebtBalance,
        'Debt',
        'none',
        intl,
        debtBalance.unwrapVaultToken().token
      )
    );
  }
  // NOTE: rolling a vault debt will repay and withdraw all current shares
  if (tradeType === 'RollVaultPosition') {
    const { priorVaultBalances } = state as VaultTradeState;
    if (priorVaultBalances) {
      const debt = priorVaultBalances.find((t) => t.tokenType === 'VaultDebt');
      const assets = priorVaultBalances.find(
        (t) => t.tokenType === 'VaultShare'
      );
      if (debt) {
        // Get the traded value of repaying a fixed rate debt
        if (debt.unwrapVaultToken().tokenType === 'fCash') {
          const fCashMarket = Registry.getExchangeRegistry().getfCashMarket(
            debt.network,
            debt.currencyId
          );
          const { netRealized } = exchangeToLocalPrime(
            debt.neg(),
            fCashMarket,
            debt.unwrapVaultToken().toPrimeCash().token
          );
          summary.push(
            getTradeDetail(
              netRealized,
              'Debt',
              'repay',
              intl,
              debt.unwrapVaultToken().token
            )
          );
        } else {
          summary.push(getTradeDetail(debt.neg(), 'Debt', 'repay', intl));
        }
      }

      if (assets)
        summary.push(getTradeDetail(assets.neg(), 'Asset', 'withdraw', intl));
    }
  }

  if (collateralBalance && netRealizedCollateralBalance) {
    summary.push(
      getTradeDetail(
        depositBalance
          ? netRealizedCollateralBalance.sub(depositBalance)
          : netRealizedCollateralBalance,
        'Asset',
        'none',
        intl,
        collateralBalance.token
      )
    );
  }

  return summary;
}

function getRollDebtOrConvertAssetSummary(
  state: TradeState | VaultTradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  const {
    collateralBalance,
    debtBalance,
    netRealizedCollateralBalance,
    netRealizedDebtBalance,
    tradeType,
  } = state;

  if (netRealizedDebtBalance && debtBalance) {
    summary.push(
      getTradeDetail(
        netRealizedDebtBalance.neg(),
        tradeType === 'RollDebt' ? 'Debt' : 'Asset',
        tradeType === 'RollDebt' ? 'none' : 'withdraw',
        intl,
        tradeType === 'ConvertAsset' && debtBalance.tokenType === 'PrimeDebt'
          ? debtBalance.toPrimeCash().token
          : debtBalance.unwrapVaultToken().token
      )
    );
  }

  if (netRealizedCollateralBalance && collateralBalance)
    summary.push(
      getTradeDetail(
        tradeType === 'RollDebt' && collateralBalance.tokenType === 'fCash'
          ? netRealizedCollateralBalance
          : netRealizedCollateralBalance.neg(),
        tradeType === 'RollDebt' ? 'Debt' : 'Asset',
        tradeType === 'RollDebt' ? 'repay' : 'none',
        intl,
        collateralBalance.unwrapVaultToken().token
      )
    );

  return summary;
}

function getDeleverageWithdrawSummary(
  state: TradeState | VaultTradeState,
  intl: IntlShape
): DetailItem[] {
  const summary: DetailItem[] = [];
  const {
    collateralBalance,
    debtBalance,
    netRealizedCollateralBalance,
    netRealizedDebtBalance,
    depositBalance,
    tradeType,
    maxWithdraw,
  } = state;
  const isSwapped = isDeleverageWithSwappedTokens(state);
  const isVault = isVaultTrade(tradeType);

  if (netRealizedCollateralBalance && collateralBalance)
    summary.push(
      getTradeDetail(
        depositBalance && isVault && !maxWithdraw
          ? netRealizedCollateralBalance.add(depositBalance)
          : netRealizedCollateralBalance,
        isSwapped ? 'Debt' : 'Asset',
        isSwapped ? 'repay' : 'withdraw',
        intl,
        collateralBalance.unwrapVaultToken().token
      )
    );

  if (netRealizedDebtBalance && debtBalance) {
    summary.push(
      getTradeDetail(
        netRealizedDebtBalance,
        isSwapped ? 'Asset' : 'Debt',
        isSwapped ? 'withdraw' : 'repay',
        intl,
        debtBalance.unwrapVaultToken().token
      )
    );
  }

  return summary;
}

export function useTradeSummary(state: VaultTradeState | TradeState) {
  const intl = useIntl();
  const theme = useTheme();
  const {
    depositBalance: _d,
    netAssetBalance,
    netDebtBalance,
    debtBalance,
    collateralBalance,
    collateralFee,
    debtFee,
    deposit,
    tradeType,
    inputsSatisfied,
    calculationSuccess,
  } = state;
  const depositBalance = _d;
  const { totalAPY } = useTotalAPY(state);

  const underlying =
    netAssetBalance?.underlying ||
    netDebtBalance?.underlying ||
    depositBalance?.token;
  if (!inputsSatisfied || !calculationSuccess || !underlying)
    return {
      summary: undefined,
      total: undefined,
    };

  // On leverage or roll, labels are slightly different
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

  const feeItems = getFeeItems(
    underlying,
    isLeverageOrRoll,
    depositBalance,
    collateralBalance,
    debtBalance,
    collateralFee,
    debtFee,
    tradeType,
    theme
  );

  let summary: DetailItem[] = [];
  if (tradeType === 'StakeNOTE' || tradeType === 'StakeNOTERedeem') {
    summary.push(...getStakeNOTESummary(state, intl));
  } else if (
    isLeverageOrRoll &&
    (depositBalance?.isPositive() ||
      tradeType === 'IncreaseVaultPosition' ||
      tradeType === 'RollVaultPosition' ||
      (tradeType === 'LeveragedNTokenAdjustLeverage' &&
        debtBalance.tokenType !== 'nToken') ||
      (tradeType === 'AdjustVaultLeverage' && debtBalance.isNegative()))
  ) {
    summary.push(...getLeverageSummary(state, intl));
  } else if (
    isLeverageOrRoll &&
    (tradeType === 'WithdrawVault' ||
      tradeType === 'Deleverage' ||
      tradeType === 'DeleverageWithdraw' ||
      (tradeType === 'LeveragedNTokenAdjustLeverage' &&
        debtBalance.tokenType === 'nToken') ||
      (tradeType === 'AdjustVaultLeverage' && debtBalance.isPositive()))
  ) {
    summary.push(...getDeleverageWithdrawSummary(state, intl));
  } else if (
    isLeverageOrRoll &&
    (tradeType === 'RollDebt' || tradeType === 'ConvertAsset')
  ) {
    summary.push(...getRollDebtOrConvertAssetSummary(state, intl));
  } else if (depositBalance?.isPositive()) {
    summary.push(...getDepositSummary(state, intl));
  } else if (depositBalance?.isNegative()) {
    summary.push(...getWithdrawSummary(state, intl));
  } else {
    return { summary: undefined, total: undefined };
  }

  const walletTotal = getTotalWalletItem(
    depositBalance || TokenBalance.zero(underlying),
    intl
  );

  summary.push(...feeItems);

  let total: DetailItem;
  let earnings: TokenBalance | undefined;
  if (tradeType === 'LendFixed' && depositBalance && collateralBalance) {
    earnings = depositBalance
      .copy(
        collateralBalance.scaleTo(depositBalance.decimals).sub(depositBalance.n)
      )
      // When lending fixed, the fee value should be added back to the earnings so
      // that it nets off with the total at maturity
      .add(collateralFee?.toUnderlying() || depositBalance.copy(0));
  } else if (tradeType === 'BorrowFixed' && depositBalance && debtBalance) {
    earnings = depositBalance.copy(
      depositBalance.n.sub(debtBalance.scaleTo(depositBalance?.decimals))
    );
  } else if (tradeType === 'LendVariable' || tradeType === 'MintNToken') {
    earnings = calculate30dEarnings(collateralBalance, totalAPY);
  } else if (tradeType === 'BorrowVariable') {
    earnings = calculate30dEarnings(debtBalance, totalAPY)?.neg();
  } else if (
    tradeType === 'CreateVaultPosition' ||
    tradeType === 'LeveragedNToken'
  ) {
    const netWorth = depositBalance
      ?.sub(debtFee?.toUnderlying() || TokenBalance.zero(underlying))
      .sub(collateralFee?.toUnderlying() || TokenBalance.zero(underlying));
    earnings = netWorth ? calculate30dEarnings(netWorth, totalAPY) : undefined;
  } else {
    earnings = undefined;
  }

  if (summary.length === 0) return { summary: undefined, total: undefined };

  if (
    tradeType === 'LendFixed' ||
    tradeType === 'LendVariable' ||
    tradeType === 'MintNToken' ||
    tradeType === 'RepayDebt' ||
    tradeType === 'CreateVaultPosition' ||
    tradeType === 'LeveragedNToken' ||
    tradeType === 'StakeNOTE'
  ) {
    total = summary.shift() as DetailItem;
    total.isTotalRow = true;
    total.value.data[0].showPositiveAsGreen = false;
    if (
      tradeType === 'CreateVaultPosition' ||
      tradeType === 'LeveragedNToken'
    ) {
      total.label = intl.formatMessage(
        defineMessage({ defaultMessage: 'Net Worth' })
      );
      // Subtract fees from the deposit balance
      total.value.data[0].displayValue = depositBalance
        ?.sub(debtFee?.toUnderlying() || TokenBalance.zero(underlying))
        .sub(collateralFee?.toUnderlying() || TokenBalance.zero(underlying))
        .toDisplayStringWithSymbol(4, true, false);
    }
    walletTotal.value.data[0].showPositiveAsGreen = true;
    summary =
      tradeType === 'StakeNOTE'
        ? [...summary, total]
        : [walletTotal, ...summary, total];
  } else if (tradeType === 'StakeNOTERedeem') {
    // no-op, ignore wallet total row
  } else {
    walletTotal.isTotalRow = true;
    summary.push(walletTotal);
  }

  const totalAtMaturity =
    collateralBalance && deposit && tradeType === 'LendFixed'
      ? TokenBalance.from(collateralBalance.scaleTo(deposit?.decimals), deposit)
      : undefined;

  if (earnings) {
    const isDebt =
      tradeType === 'BorrowFixed' || tradeType === 'BorrowVariable';

    // Show the plus on positive values except for borrow fixed
    const prefixSymbol = earnings.isPositive() && !isDebt ? '+' : '';

    const earningsRow = {
      isTotalRow: true,
      isEarningsRow: true,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      label: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        text: tradeType && Earnings[tradeType] ? Earnings[tradeType] : '',
      },
      value: {
        data: [
          {
            displayValue: `${prefixSymbol}${earnings.toDisplayStringWithSymbol()}`,
            // Show red when earnings are negative in leverage scenarios
            isNegative: earnings.isNegative(),
            showPositiveAsGreen: !isDebt,
          },
        ],
      },
    };

    summary.push(earningsRow);
  }

  return { summary, earnings, totalAtMaturity };
}
