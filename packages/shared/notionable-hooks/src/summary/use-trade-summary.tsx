import { Box, Theme, useTheme } from '@mui/material';
import {
  FiatKeys,
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
  adjustValueUnderlying?: TokenBalance
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
            displayValue: b
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
            displayValue: b
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
            displayValue: b
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
            displayValue: (adjustValueUnderlying
              ? // Used to adjust valuation post nToken mint with minting bonus
                b.toUnderlying().add(adjustValueUnderlying)
              : b.toUnderlying()
            ).toDisplayStringWithSymbol(4, true, false),
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
  tradeType: TradeType | VaultTradeType | undefined,
  depositBalance: TokenBalance | undefined,
  collateralBalance: TokenBalance | undefined,
  debtBalance: TokenBalance | undefined,
  collateralFee: TokenBalance | undefined,
  debtFee: TokenBalance | undefined
): TokenBalance {
  const zeroUnderlying = TokenBalance.zero(underlying);

  if (tradeType === 'RollVaultPosition') {
    return zeroUnderlying;
  } else if (isLeverageOrRoll) {
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

  // TODO: if underlying is not all the same the convert to fiat currency instead
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

  let feeValue = getFeeValue(
    underlying,
    isLeverageOrRoll,
    tradeType,
    depositBalance,
    collateralBalance,
    debtBalance,
    collateralFee,
    debtFee
  );

  const summary: DetailItem[] = [];
  if (isLeverageOrRoll) {
    if (
      depositBalance?.isPositive() ||
      tradeType === 'LeveragedNTokenAdjustLeverage' ||
      tradeType === 'IncreaseVaultPosition' ||
      tradeType === 'RollVaultPosition'
    ) {
      // Deposit and Mint X
      if (depositBalance?.isPositive()) {
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
      // NOTE: technically net asset changes may occur here inside Leveraged Lend
      // or Leveraged Liquidity but currently they won't show in the trade summary
      // Borrow
      summary.push(getTradeDetail(debtBalance, 'Debt', 'none', intl));

      // NOTE: rolling a vault debt will repay and withdraw all current shares
      if (tradeType === 'RollVaultPosition') {
        const { priorVaultBalances } = state as VaultTradeState;
        if (priorVaultBalances) {
          const debt = priorVaultBalances.find(
            (t) => t.tokenType === 'VaultDebt'
          );
          const assets = priorVaultBalances.find(
            (t) => t.tokenType === 'VaultShare'
          );
          if (debt) {
            summary.push(getTradeDetail(debt.neg(), 'Debt', 'repay', intl));
            feeValue = debt.toUnderlying().sub(debtBalance.toUnderlying());
          }

          if (assets)
            summary.push(
              getTradeDetail(assets.neg(), 'Asset', 'withdraw', intl)
            );
        }
      }

      // Mint X - deposit
      summary.push(
        getTradeDetail(
          depositBalance
            ? collateralBalance.toUnderlying().sub(depositBalance)
            : collateralBalance.toUnderlying(),
          'Asset',
          'none',
          intl,
          collateralBalance.token
        )
      );
    } else if (tradeType === 'WithdrawVault') {
      // Sell assets
      summary.push(
        getTradeDetail(collateralBalance.neg(), 'Asset', 'withdraw', intl)
      );
      // Repay debt
      summary.push(getTradeDetail(debtBalance, 'Debt', 'repay', intl));
      /** NOTE: net asset and balance changes are used below here **/
    } else if (
      tradeType === 'Deleverage' ||
      tradeType === 'DeleverageWithdraw'
    ) {
      summary.push(getTradeDetail(debtBalance, 'Asset', 'none', intl));
      summary.push(getTradeDetail(collateralBalance, 'Debt', 'repay', intl));
    } else if (tradeType === 'RollDebt') {
      // Asset to repay: this never changes signs
      summary.push(getTradeDetail(collateralBalance, 'Debt', 'repay', intl));

      if (netAssetBalance?.isZero() === false)
        // This only exists if the new debt maturity has fCash in it
        summary.push(
          getTradeDetail(
            netAssetBalance,
            'Asset',
            netAssetBalance.isNegative() ? 'withdraw' : 'none',
            intl
          )
        );
      // New borrow balance
      if (netDebtBalance?.isZero() === false)
        summary.push(getTradeDetail(netDebtBalance, 'Debt', 'none', intl));
    } else if (tradeType === 'ConvertAsset') {
      // Asset to sell: this sign never changes
      summary.push(
        getTradeDetail(
          debtBalance.tokenType === 'PrimeDebt'
            ? debtBalance.toPrimeCash()
            : debtBalance,
          'Asset',
          'withdraw',
          intl
        )
      );

      if (netDebtBalance?.isZero() === false)
        // This only exists if the debt is being repaid in the new maturity
        summary.push(
          getTradeDetail(
            netDebtBalance,
            'Debt',
            netDebtBalance.isPositive() ? 'repay' : 'none',
            intl
          )
        );
      if (netAssetBalance?.isZero() === false)
        // This is the new asset balance
        summary.push(getTradeDetail(netAssetBalance, 'Asset', 'none', intl));
    }
  } else if (depositBalance?.isPositive()) {
    if (netDebtBalance?.isZero() === false)
      summary.push(getTradeDetail(netDebtBalance, 'Debt', 'deposit', intl));
    if (netAssetBalance?.isZero() === false) {
      if (tradeType === 'RepayDebt') {
        summary.push(getTradeDetail(netAssetBalance, 'Debt', 'deposit', intl));
      } else {
        // In here, if the fee value is positive then it needs to be adjusted...
        summary.push(
          getTradeDetail(
            netAssetBalance,
            'Asset',
            'deposit',
            intl,
            undefined,
            feeValue.isNegative() && netAssetBalance.tokenType === 'nToken'
              ? feeValue.neg()
              : undefined
          )
        );
      }
    }
  } else if (depositBalance?.isNegative()) {
    if (netAssetBalance?.isZero() === false)
      summary.push(
        getTradeDetail(netAssetBalance.neg(), 'Asset', 'withdraw', intl)
      );
    if (netDebtBalance?.isZero() === false) {
      if (
        netDebtBalance.tokenType === 'PrimeDebt' &&
        tradeType === 'Withdraw'
      ) {
        summary.push(
          getTradeDetail(
            netDebtBalance.toPrimeCash().abs(),
            'Asset',
            'withdraw',
            intl
          )
        );
      } else {
        summary.push(
          getTradeDetail(
            netDebtBalance.abs(),
            'Debt',
            netDebtBalance.isNegative() ? 'withdraw' : 'deposit',
            intl
          )
        );
      }
    }
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
