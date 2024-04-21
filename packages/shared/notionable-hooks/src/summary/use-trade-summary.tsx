import { Box, Theme, useTheme } from '@mui/material';
import {
  FiatKeys,
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { InfoTooltip } from '@notional-finance/mui';
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
} from 'react-intl';
import { DetailItem, OrderDetailLabels, TradeSummaryLabels } from '.';
import { useFiat } from '../use-user-settings';
import { exchangeToLocalPrime } from '@notional-finance/transaction';

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
        : OrderDetailLabels.amountFromWallet
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
        {
          displayValue: depositBalance
            .abs()
            .toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false),
          isNegative: false,
        },
      ],
    },
    isTotalRow: true,
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
      label: intl.formatMessage(
        TradeSummaryLabels[tokenType][b.isNegative() ? 'withdraw' : typeKey],
        {
          caption,
        }
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
  }

  throw Error('invalid asset key');
}

const FeeItem = ({
  feeToolTip,
  feeValue,
  toolTipColor,
}: {
  feeToolTip: MessageDescriptor | undefined;
  feeValue: TokenBalance;
  toolTipColor: string;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {feeToolTip && (
        <InfoTooltip
          iconColor={toolTipColor}
          iconSize={theme.spacing(1.5)}
          toolTipText={feeToolTip}
          sx={{
            fill: toolTipColor,
            marginRight: theme.spacing(0.5),
            fontSize: 'inherit',
          }}
        />
      )}
      {feeValue.toDisplayStringWithSymbol(4, true, false)}
    </Box>
  );
};

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
  theme: Theme,
  intl: IntlShape
): DetailItem {
  if (collateralBalance?.tokenType === 'nToken' && feeValue.isNegative()) {
    return {
      label: intl.formatMessage({ defaultMessage: 'Mint Bonus' }),
      value: {
        data: [
          {
            displayValue: (
              <FeeItem
                feeValue={feeValue}
                feeToolTip={defineMessage({
                  defaultMessage:
                    'Minting nTokens at high utilization results in a small bonus due to an increase in the nToken valuation.',
                })}
                toolTipColor={theme.palette.info.dark}
              />
            ),
            isNegative: false,
            showPositiveAsGreen: true,
          },
        ],
      },
    };
  }

  let feeToolTip: MessageDescriptor | undefined;
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
      feeToolTip = defineMessage({
        defaultMessage:
          'Fixed rate volatility is causing a larger than normal minting fee. This fee goes to zero as fixed rates stabilize.',
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
      feeToolTip = defineMessage({
        defaultMessage:
          'High fixed rate utilization is causing high redemption cost. This will decrease if more liquidity is provided, if fixed rates come down, or gradually over time as fixed rate loans mature.',
      });
    }
  }

  return {
    label: intl.formatMessage({ defaultMessage: 'Fees and Slippage' }),
    value: {
      data: [
        {
          displayValue: (
            <FeeItem
              feeValue={feeValue}
              feeToolTip={feeToolTip}
              toolTipColor={theme.palette.warning.main}
            />
          ),
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
          'deposit',
          intl,
          netAssetBalance.token
        )
      );
    } else {
      // In here, if the fee value is positive then it needs to be adjusted...
      summary.push(
        getTradeDetail(
          netRealizedCollateralBalance,
          'Asset',
          'deposit',
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
        tradeType === 'RollDebt'
          ? netRealizedDebtBalance.abs()
          : netRealizedDebtBalance.neg(),
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
        tradeType === 'RollDebt'
          ? netRealizedCollateralBalance.neg()
          : netRealizedCollateralBalance.abs(),
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

  // TODO: not clear which one should be negative or positive
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
        netRealizedDebtBalance.neg(),
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
    tradeType,
    inputsSatisfied,
    calculationSuccess,
  } = state;
  const depositBalance = _d;

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

  const summary: DetailItem[] = [];
  if (
    isLeverageOrRoll &&
    (depositBalance?.isPositive() ||
      tradeType === 'LeveragedNTokenAdjustLeverage' ||
      tradeType === 'IncreaseVaultPosition' ||
      tradeType === 'RollVaultPosition')
  ) {
    summary.push(...getLeverageSummary(state, intl));
  } else if (
    isLeverageOrRoll &&
    (tradeType === 'WithdrawVault' ||
      tradeType === 'Deleverage' ||
      tradeType === 'DeleverageWithdraw')
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
    theme,
    intl
  );

  const total = getTotalWalletItem(
    depositBalance || TokenBalance.zero(underlying),
    baseCurrency,
    intl
  );

  summary.push(feeDetailItem);
  summary.push(total);

  return { summary, total };
}
