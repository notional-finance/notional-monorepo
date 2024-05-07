import { Theme, useTheme } from '@mui/material';
import {
  FiatKeys,
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
  TradeType,
  VaultTradeType,
  isDeleverageWithSwappedTokens,
  isVaultTrade,
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
import { useFiat } from '../use-user-settings';
import { exchangeToLocalPrime } from '@notional-finance/transaction';
import { useTotalAPY } from './use-total-apy';

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
  baseCurrency: FiatKeys,
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
        // {
        //   displayValue: depositBalance
        //     .abs()
        //     .toFiat(baseCurrency)
        //     .toDisplayStringWithSymbol(2, true, false),
        //   isNegative: false,
        // },
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
  }

  throw Error('invalid asset key');
}

function getFeeValue(
  underlying: TokenDefinition,
  isLeverageOrRoll: boolean,
  depositBalance: TokenBalance | undefined,
  collateralBalance: TokenBalance | undefined,
  debtBalance: TokenBalance | undefined,
  collateralFee: TokenBalance | undefined,
  debtFee: TokenBalance | undefined
): TokenBalance {
  const zeroUnderlying = TokenBalance.zero(underlying);

  if (isLeverageOrRoll) {
    // Do not include roll vault position because the margin will be
    // incorrectly included in the fee value
    return (collateralFee?.toUnderlying() || zeroUnderlying).add(
      debtFee?.toUnderlying() || zeroUnderlying
    );
  } else if (
    collateralBalance &&
    depositBalance &&
    // NOTE: Deposit balances are emitted prior to collateral balances here and
    // so it causes the fee value to "toggle" a bit as the value changes. Ideally
    // we move the calculations into the observable so this is hidden
    collateralBalance.currencyId === depositBalance.currencyId
  ) {
    return collateralFee?.toUnderlying() || zeroUnderlying;
  } else if (
    debtBalance &&
    depositBalance &&
    debtBalance.currencyId === depositBalance.currencyId
  ) {
    return debtFee?.toUnderlying() || zeroUnderlying;
  } else {
    return zeroUnderlying;
  }
}

function getFeeDetailItem(
  feeValue: TokenBalance,
  collateralBalance: TokenBalance | undefined,
  debtBalance: TokenBalance | undefined,
  collateralFee: TokenBalance | undefined,
  debtFee: TokenBalance | undefined,
  tradeType: TradeType | VaultTradeType | undefined,
  theme: Theme
): DetailItem {
  if (collateralBalance?.tokenType === 'nToken' && feeValue.isNegative()) {
    return {
      label: {
        text: defineMessages({
          content: { defaultMessage: 'Mint Bonus' },
          toolTipContent: {
            defaultMessage:
              'Minting nTokens at high utilization results in a small bonus due to an increase in the nToken valuation.',
          },
        }),
      },
      value: {
        data: [
          {
            displayValue: feeValue.toDisplayStringWithSymbol(4, true, false),
            isNegative: false,
            showPositiveAsGreen: true,
          },
        ],
      },
    };
  }

  type FeeMessages = {
    content: MessageDescriptor;
    toolTipContent: MessageDescriptor;
  };

  let feeToolTip: FeeMessages | undefined;
  if (collateralBalance?.tokenType === 'nToken' && collateralFee) {
    const feePercent = collateralFee
      .toUnderlying()
      .ratioWith(collateralBalance.toUnderlying())
      .abs()
      .toNumber();
    if (
      (isLeveragedTrade(tradeType) && feePercent > 50 * BASIS_POINT) ||
      (!isLeveragedTrade(tradeType) && feePercent > 10 * BASIS_POINT)
    ) {
      feeToolTip = defineMessages({
        content: { defaultMessage: 'Fees and Slippage' },
        toolTipContent: {
          defaultMessage:
            'Minting nTokens at high utilization results in a small bonus due to an increase in the nToken valuation.',
        },
      });
    }
  } else if (debtBalance?.tokenType === 'nToken' && debtFee) {
    const feePercent = debtFee
      .toUnderlying()
      .ratioWith(debtBalance.toUnderlying())
      .abs()
      .toNumber();
    if (
      (isDeleverageTrade(tradeType) && feePercent > 50 * BASIS_POINT) ||
      (!isDeleverageTrade(tradeType) && feePercent > 20 * BASIS_POINT)
    ) {
      feeToolTip = defineMessages({
        content: { defaultMessage: 'Fees and Slippage' },
        toolTipContent: {
          defaultMessage:
            'High fixed rate utilization is causing high redemption cost. This will decrease if more liquidity is provided, if fixed rates come down, or gradually over time as fixed rate loans mature.',
        },
      });
    }
  }

  return {
    label: {
      text: feeToolTip
        ? feeToolTip
        : defineMessages({
            content: { defaultMessage: 'Fees and Slippage' },
          }),
      iconColor: theme.palette.warning.main,
    },
    value: {
      data: [
        {
          displayValue: feeValue.toDisplayStringWithSymbol(4, true, false),
          isNegative: feeValue.isNegative(),
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
  const baseCurrency = useFiat();
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
  const { totalAPY, assetAPY, debtAPY } = useTotalAPY(state);

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

  const feeValue = getFeeValue(
    underlying,
    isLeverageOrRoll,
    depositBalance,
    collateralBalance,
    debtBalance,
    collateralFee,
    debtFee
  );

  let summary: DetailItem[] = [];
  if (
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

  const feeDetailItem = getFeeDetailItem(
    feeValue,
    collateralBalance,
    debtBalance,
    collateralFee,
    debtFee,
    tradeType,
    theme
  );

  const walletTotal = getTotalWalletItem(
    depositBalance || TokenBalance.zero(underlying),
    baseCurrency,
    intl
  );

  summary.push(feeDetailItem);

  let total: DetailItem;
  let earnings: TokenBalance | undefined;
  if (tradeType === 'LendFixed' && depositBalance && collateralBalance) {
    earnings = depositBalance
      .copy(
        collateralBalance.scaleTo(depositBalance.decimals).sub(depositBalance.n)
      )
      .add(feeValue);
  } else if (tradeType === 'BorrowFixed' && depositBalance && debtBalance) {
    earnings = depositBalance.copy(
      depositBalance.n.sub(debtBalance.scaleTo(depositBalance?.decimals))
    );
  } else if (tradeType === 'LendVariable' || tradeType === 'MintNToken') {
    earnings = calculate30dEarnings(collateralBalance, totalAPY);
  } else if (tradeType === 'BorrowVariable') {
    earnings = calculate30dEarnings(debtBalance, totalAPY);
  } else if (
    tradeType === 'CreateVaultPosition' ||
    tradeType === 'LeveragedNToken'
  ) {
    const assetEarnings = calculate30dEarnings(collateralBalance, assetAPY);
    const debtCost = calculate30dEarnings(debtBalance, debtAPY)?.abs().neg();
    earnings =
      assetEarnings && debtCost ? assetEarnings.sub(debtCost) : undefined;
  } else {
    earnings = undefined;
  }

  if (
    tradeType === 'LendFixed' ||
    tradeType === 'LendVariable' ||
    tradeType === 'MintNToken' ||
    tradeType === 'RepayDebt' ||
    tradeType === 'CreateVaultPosition' ||
    tradeType === 'LeveragedNToken'
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
    }
    walletTotal.value.data[0].showPositiveAsGreen = true;
    summary = [walletTotal, ...summary, total];
  } else {
    walletTotal.isTotalRow = true;
    summary.push(walletTotal);
  }

  const totalAtMaturity =
    collateralBalance && deposit && tradeType === 'LendFixed'
      ? TokenBalance.from(
          collateralBalance.scaleTo(deposit?.decimals),
          deposit
        ).sub(feeValue)
      : undefined;

  if (earnings) {
    const isDebt =
      tradeType === 'BorrowFixed' || tradeType === 'BorrowVariable';

    const prefixSymbol = isDebt ? '-' : '+';

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
            displayValue: `${prefixSymbol}${earnings?.toDisplayStringWithSymbol()}`,
            isNegative: false,
            showPositiveAsGreen: !isDebt,
          },
        ],
      },
    };

    summary.push(earningsRow);
  }

  return { summary, earnings, totalAtMaturity };
}
