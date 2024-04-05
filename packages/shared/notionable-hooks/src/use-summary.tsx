import {
  TokenBalance,
  TokenDefinition,
  FiatKeys,
} from '@notional-finance/core-entities';
import {
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  BaseTradeState,
  TokenOption,
  TradeState,
  VaultTradeState,
} from '@notional-finance/notionable';
import {
  RATE_DECIMALS,
  HEALTH_FACTOR_RISK_LEVELS,
  BASIS_POINT,
} from '@notional-finance/util';
import {
  IntlShape,
  MessageDescriptor,
  defineMessage,
  defineMessages,
  useIntl,
} from 'react-intl';
import { useFiat } from './use-user-settings';
import { colors } from '@notional-finance/styles';
import { Box, useTheme } from '@mui/material';
import { useVaultPosition } from './use-account';
import { InfoTooltip } from '@notional-finance/mui';

interface DetailItem {
  label: React.ReactNode;
  value: {
    data: {
      displayValue?: React.ReactNode;
      showPositiveAsGreen?: boolean;
      isNegative?: boolean;
    }[];
  };
  showOnExpand?: boolean;
  isTotalRow?: boolean;
}

interface OrderDetails {
  orderDetails: DetailItem[];
  filteredOrderDetails: DetailItem[];
}

const OrderDetailLabels = defineMessages({
  amountToWallet: { defaultMessage: 'Amount to Wallet' },
  amountFromWallet: { defaultMessage: 'Amount from Wallet' },
  fCashBought: { defaultMessage: '{title} Bought ({caption})' },
  fCashSold: { defaultMessage: '{title} Sold ({caption})' },
  vaultShareMinted: { defaultMessage: '{title} Minted ({caption})' },
  vaultShareRedeemed: { defaultMessage: '{title} Redeemed ({caption})' },
  assetMinted: { defaultMessage: '{title} Minted' },
  assetRedeemed: { defaultMessage: '{title} Redeemed' },
  primeDebtBorrowed: { defaultMessage: '{title} Borrowed' },
  primeDebtRepaid: { defaultMessage: '{title} Repaid' },
  apy: { defaultMessage: '{title} APY' },
  price: { defaultMessage: '{title} Price' },
  fee: { defaultMessage: '{title} Fee' },
  captionFee: { defaultMessage: '{title} Fee ({caption})' },
  captionAPY: { defaultMessage: '{title} APY ({caption})' },
  captionPrice: { defaultMessage: '{title} Price ({caption})' },
});

function getOrderDetails(
  b: TokenBalance,
  realized: TokenBalance,
  feeValue: TokenBalance,
  intl: IntlShape,
  isLeverageOrRoll: boolean,
  options: TokenOption[] | undefined
): DetailItem[] {
  const { title, caption } = formatTokenType(b.token);
  const apyLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionAPY
      : OrderDetailLabels.apy;
  const feeLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionFee
      : OrderDetailLabels.fee;
  const priceLabel =
    b.tokenType === 'fCash' || b.tokenType === 'VaultShare'
      ? OrderDetailLabels.captionPrice
      : OrderDetailLabels.price;
  const apy = options?.find((o) => o.token.id === b.tokenId)?.interestRate;

  let valueLabel: MessageDescriptor;
  switch (b.tokenType) {
    case 'PrimeCash':
    case 'nToken':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.assetMinted
        : OrderDetailLabels.assetRedeemed;
      break;
    case 'fCash':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.fCashBought
        : OrderDetailLabels.fCashSold;
      break;
    case 'VaultShare':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.vaultShareMinted
        : OrderDetailLabels.vaultShareRedeemed;
      break;
    case 'PrimeDebt':
      valueLabel = b.isPositive()
        ? OrderDetailLabels.primeDebtRepaid
        : OrderDetailLabels.primeDebtBorrowed;
      break;
    default:
      throw Error('Unknown token type');
  }

  const orderDetails = [
    {
      label: intl.formatMessage(valueLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${
              isLeverageOrRoll
                ? b.toDisplayString(4, true, false)
                : b.abs().toDisplayString(4, true, false)
            } ${title}`,
            isNegative: isLeverageOrRoll ? b.isNegative() : false,
          },
        ],
      },
    },
    {
      label: intl.formatMessage(feeLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: feeValue
              .toUnderlying()
              .toDisplayStringWithSymbol(4, true, false),
          },
        ],
      },
    },
    {
      // Price: realized cash / total units
      label: intl.formatMessage(priceLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: realized
              .abs()
              .toUnderlying()
              .divInRatePrecision(b.abs().scaleTo(RATE_DECIMALS))
              .toDisplayStringWithSymbol(4, true, false),
            isNegative: false,
          },
        ],
      },
      showOnExpand: true,
    },
  ];

  if (apy !== undefined) {
    orderDetails.push({
      label: intl.formatMessage(apyLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${formatNumberAsPercent(apy, 2)}`,
            isNegative: apy < 0,
          },
        ],
      },
      showOnExpand: true,
    });
  }

  return orderDetails;
}

export function useOrderDetails(state: BaseTradeState): OrderDetails {
  const {
    debtBalance,
    debtFee,
    collateralFee,
    debtOptions,
    collateralOptions,
    collateralBalance,
    netRealizedDebtBalance,
    netRealizedCollateralBalance,
    depositBalance,
    tradeType,
  } = state;
  const intl = useIntl();
  const orderDetails: DetailItem[] = [];
  // Only show positive values if one of the values is defined
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

  if (depositBalance?.isPositive()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
      value: {
        data: [
          {
            displayValue: depositBalance.toDisplayStringWithSymbol(
              4,
              true,
              false
            ),
            isNegative: depositBalance.isNegative(),
          },
        ],
      },
    });
  }

  // NOTE: if sign changes occur, they don't get marked here
  if (debtBalance?.isZero() === false && netRealizedDebtBalance) {
    // Undo withdraw and convert token type here
    const balance =
      debtBalance.tokenType === 'PrimeDebt' &&
      (tradeType === 'ConvertAsset' || tradeType === 'Withdraw')
        ? debtBalance.toPrimeCash()
        : debtBalance;

    orderDetails.push(
      ...getOrderDetails(
        balance.unwrapVaultToken(),
        netRealizedDebtBalance,
        debtFee?.toUnderlying() || netRealizedDebtBalance.copy(0),
        intl,
        isLeverageOrRoll,
        debtOptions
      )
    );
  }

  if (collateralBalance?.isZero() === false && netRealizedCollateralBalance) {
    // Undo withdraw and convert token type here
    orderDetails.push(
      ...getOrderDetails(
        collateralBalance.unwrapVaultToken(),
        netRealizedCollateralBalance,
        collateralFee?.toUnderlying() || netRealizedCollateralBalance.copy(0),
        intl,
        isLeverageOrRoll,
        collateralOptions
      )
    );
  }

  if (depositBalance?.isNegative()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountToWallet),
      value: {
        data: [
          {
            displayValue: depositBalance
              .neg()
              .toDisplayStringWithSymbol(4, true, false),
            isNegative: depositBalance.isNegative(),
          },
        ],
      },
    });
  }

  const filteredOrderDetails: DetailItem[] = orderDetails.filter(
    ({ showOnExpand }) => !showOnExpand
  );

  return { orderDetails, filteredOrderDetails };
}

const TradeSummaryLabels = {
  VaultShare: defineMessages({
    deposit: { defaultMessage: 'Deposit and Mint Vault Shares ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Vault Shares ({caption})' },
    none: { defaultMessage: 'Mint Vault Shares ({caption})' },
    repay: { defaultMessage: 'N/A' },
  }),
  fCashLend: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Fixed ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Fixed Lend ({caption})' },
    none: { defaultMessage: 'Lend Fixed ({caption})' },
    repay: { defaultMessage: 'N/A' },
  }),
  PrimeCash: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Variable' },
    withdraw: { defaultMessage: 'Withdraw Variable Lend' },
    none: { defaultMessage: 'Lend Variable' },
    repay: { defaultMessage: 'N/A' },
  }),
  nToken: defineMessages({
    deposit: { defaultMessage: 'Deposit and Provide Liquidity' },
    withdraw: { defaultMessage: 'Withdraw Liquidity' },
    none: { defaultMessage: 'Provide Liquidity' },
    repay: { defaultMessage: 'N/A' },
  }),
  fCashDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Fixed Debt ({caption})' },
    withdraw: { defaultMessage: 'Borrow Fixed ({caption})' },
    none: { defaultMessage: 'Borrow Fixed ({caption})' },
    repay: { defaultMessage: 'Repay Fixed ({caption})' },
  }),
  PrimeDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Variable Debt' },
    withdraw: { defaultMessage: 'Borrow Variable' },
    none: { defaultMessage: 'Borrow Variable' },
    repay: { defaultMessage: 'Repay Variable Debt' },
  }),
};

function getTradeDetail(
  b: TokenBalance,
  assetOrDebt: 'Asset' | 'Debt',
  typeKey: 'deposit' | 'withdraw' | 'none' | 'repay',
  intl: IntlShape,
  _token?: TokenDefinition
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
            displayValue: b
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

  let feeValue = TokenBalance.zero(underlying);
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
        summary.push(getTradeDetail(netAssetBalance, 'Asset', 'deposit', intl));
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

  if (tradeType === 'RollVaultPosition') {
    // No-Op: value is set above
  } else if (isLeverageOrRoll) {
    // Do not include roll vault position because the margin will be
    // incorrectly included in the fee value
    feeValue = (collateralFee?.toUnderlying() || feeValue).add(
      debtFee?.toUnderlying() || feeValue
    );
  } else if (
    collateralBalance &&
    depositBalance &&
    // NOTE: Deposit balances are emitted prior to collateral balances here and
    // so it causes the fee value to "toggle" a bit as the value changes. Ideally
    // we move the calculations into the observable so this is hidden
    collateralBalance.currencyId === depositBalance.currencyId
  ) {
    feeValue = collateralFee?.toUnderlying() || feeValue;
  } else if (
    debtBalance &&
    depositBalance &&
    debtBalance.currencyId === depositBalance.currencyId
  ) {
    feeValue = debtFee?.toUnderlying() || feeValue;
  }

  let feeToolTip: MessageDescriptor | undefined;
  if (
    collateralBalance?.tokenType === 'nToken' &&
    collateralFee &&
    collateralFee
      .toUnderlying()
      .ratioWith(collateralBalance.toUnderlying())
      .abs()
      .toNumber() >
      BASIS_POINT * 10
  ) {
    feeToolTip = defineMessage({
      defaultMessage:
        'Fixed rate volatility is causing a larger than normal minting fee. This fee goes to zero as fixed rates stabilize.',
    });
  } else if (
    debtBalance?.tokenType === 'nToken' &&
    debtFee &&
    debtFee
      .toUnderlying()
      .ratioWith(debtBalance.toUnderlying())
      .abs()
      .toNumber() >
      BASIS_POINT * 10
  ) {
    feeToolTip = defineMessage({
      defaultMessage:
        'High fixed rate utilization is causing high redemption cost. This will decrease if more liquidity is provided, if fixed rates come down, or gradually over time as fixed rate loans mature.',
    });
  }

  summary.push({
    label: intl.formatMessage({ defaultMessage: 'Fees and Slippage' }),
    value: {
      data: [
        {
          displayValue: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {feeToolTip && (
                <InfoTooltip
                  iconColor={theme.palette.warning.main}
                  iconSize={theme.spacing(1.5)}
                  toolTipText={feeToolTip}
                  sx={{
                    marginTop: '-1px',
                    fill: theme.palette.warning.main,
                    marginRight: theme.spacing(0.5),
                    fontSize: 'inherit',
                  }}
                />
              )}
              {feeValue.toDisplayStringWithSymbol(4, true, false)}
            </Box>
          ),
          isNegative: feeValue.isNegative(),
        },
      ],
    },
  });

  // Label is Total to Wallet or Total from Wallet
  const total: DetailItem = depositBalance
    ? {
        label: intl.formatMessage(
          depositBalance.isPositive()
            ? OrderDetailLabels.amountFromWallet
            : OrderDetailLabels.amountToWallet
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
      }
    : {
        label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
        value: {
          data: [
            {
              displayValue: TokenBalance.zero(underlying).toDisplayString(
                4,
                true,
                false
              ),
              isNegative: false,
            },
            {
              displayValue: TokenBalance.zero(underlying)
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false),
              isNegative: false,
            },
          ],
        },
        isTotalRow: true,
      };

  summary.push({ ...total });

  return { summary, total };
}

export function usePortfolioComparison(
  state: TradeState | VaultTradeState,
  fiat: FiatKeys = 'USD'
) {
  const { postTradeBalances, comparePortfolio } = state;
  const allTableData = (comparePortfolio || []).map((p) => ({
    ...p,
    current: p.current.toFiat(fiat).toDisplayStringWithSymbol(2, true, false),
    updated: p.updated.toFiat(fiat).toDisplayStringWithSymbol(2, true, false),
  }));
  const filteredTableData = allTableData.filter(
    ({ changeType }) => changeType !== 'none'
  );

  return {
    onlyCurrent: postTradeBalances === undefined,
    // Sort unchanged rows to the end
    allTableData,
    filteredTableData,
  };
}

function formatLiquidationPrices(
  liquidationPrice: TradeState['liquidationPrice'],
  baseCurrency: FiatKeys,
  intl: IntlShape,
  hideArrow?: boolean
) {
  return (
    (liquidationPrice || []).map((p) => {
      return {
        ...p,
        label: p.isPriceRisk
          ? intl.formatMessage(
              { defaultMessage: '{asset} / {base} Liquidation Price' },
              {
                asset: p.asset.symbol,
                base: baseCurrency,
              }
            )
          : intl.formatMessage(
              { defaultMessage: '{asset} Liquidation Price' },
              {
                asset: formatTokenType(p.asset).title,
              }
            ),
        current: p.isPriceRisk
          ? p.current?.toFiat(baseCurrency).toDisplayStringWithSymbol() ||
            'No Risk'
          : p.current?.toUnderlying().toDisplayStringWithSymbol() || 'No Risk',
        updated: p.isPriceRisk
          ? p.updated?.toFiat(baseCurrency).toDisplayStringWithSymbol() ||
            'No Risk'
          : p.updated?.toUnderlying().toDisplayStringWithSymbol() || 'No Risk',
        textColor: '',
        hideArrow: hideArrow || false,
      };
    }) || []
  );
}

export function usePortfolioLiquidationRisk(state: TradeState) {
  const {
    priorAccountRisk,
    postAccountRisk,
    healthFactor: _h,
    liquidationPrice,
  } = state;
  const onlyCurrent = !postAccountRisk;
  const intl = useIntl();
  const baseCurrency = useFiat();
  const theme = useTheme();
  const priorAccountNoRisk =
    priorAccountRisk === undefined ||
    (priorAccountRisk?.healthFactor === null &&
      priorAccountRisk?.liquidationPrice.length === 0);
  const hideArrow = !onlyCurrent && priorAccountNoRisk ? true : false;

  const formatHealthFactorValues = (
    healthFactorValue: null | number | undefined
  ) => {
    const textColor =
      healthFactorValue &&
      healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.HIGH_RISK
        ? colors.red
        : healthFactorValue &&
          healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.MEDIUM_RISK
        ? colors.orange
        : healthFactorValue &&
          healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.LOW_RISK
        ? theme.palette.secondary.light
        : theme.palette.secondary.light;

    const value =
      healthFactorValue && healthFactorValue > 5
        ? '5+ / 5.0'
        : !healthFactorValue
        ? 'No Risk'
        : ` ${healthFactorValue?.toFixed(2)} / 5.0`;
    return { value, textColor };
  };

  const currentHFData = formatHealthFactorValues(_h?.current);
  const updatedHFData = formatHealthFactorValues(_h?.updated);

  const healthFactor = {
    ..._h,
    asset: undefined,
    label: defineMessages({
      content: { defaultMessage: 'Health Factor' },
      toolTipContent: {
        defaultMessage:
          'Your health factor shows your risk. A lower health factor means you have more risk. If your health factor drops below 1, you can be liquidated.',
      },
    }),
    current:
      onlyCurrent && _h?.current
        ? currentHFData?.value
        : _h?.current?.toFixed(2) || '',
    updated: updatedHFData?.value,
    textColor: updatedHFData?.textColor,
    hideArrow,
  };

  const liquidationPrices = formatLiquidationPrices(
    liquidationPrice,
    baseCurrency,
    intl,
    hideArrow
  );

  return {
    onlyCurrent,
    tooRisky: postAccountRisk?.freeCollateral.isNegative() || false,
    priorAccountNoRisk,
    postAccountNoRisk:
      postAccountRisk?.healthFactor === null &&
      postAccountRisk?.liquidationPrice.length === 0,
    tableData: [healthFactor, ...liquidationPrices],
  };
}

export function useVaultLiquidationRisk(state: VaultTradeState) {
  const {
    postAccountRisk,
    netWorth,
    liquidationPrice,
    borrowAPY,
    totalAPY,
    vaultAddress,
    selectedNetwork,
  } = state;
  const currentPosition = useVaultPosition(selectedNetwork, vaultAddress);
  const onlyCurrent = !postAccountRisk;
  const intl = useIntl();
  const baseCurrency = useFiat();

  const factors = [
    {
      ...totalAPY,
      label: intl.formatMessage({ defaultMessage: 'Total APY' }),
      current: formatNumberAsPercentWithUndefined(
        currentPosition?.totalAPY,
        '-'
      ),
      updated: formatNumberAsPercentWithUndefined(totalAPY?.updated, '-'),
    },
    {
      ...netWorth,
      label: intl.formatMessage({ defaultMessage: 'Net Worth' }),
      current:
        currentPosition?.netWorth
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol(2, true, false) || '-',
      updated:
        netWorth?.updated
          ?.toFiat(baseCurrency)
          .toDisplayStringWithSymbol(2, true, false) || '-',
    },
    {
      ...borrowAPY,
      label: intl.formatMessage({ defaultMessage: 'Borrow APY' }),
      current: formatNumberAsPercentWithUndefined(
        currentPosition?.borrowAPY,
        '-'
      ),
      updated: formatNumberAsPercentWithUndefined(borrowAPY?.updated, '-'),
    },
  ];

  const liquidationPrices = formatLiquidationPrices(
    (liquidationPrice || []).filter(
      (p) => p.isAssetRisk && p.asset.tokenType === 'VaultShare'
    ),
    baseCurrency,
    intl
  );

  return {
    onlyCurrent,
    tooRisky: postAccountRisk?.aboveMaxLeverageRatio || false,
    priorAccountNoRisk:
      currentPosition === undefined || currentPosition?.leverageRatio === null,
    postAccountNoRisk:
      postAccountRisk === undefined || postAccountRisk?.leverageRatio === null,
    tableData: [...factors, ...liquidationPrices],
  };
}
