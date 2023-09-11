import {
  TokenBalance,
  TokenDefinition,
  YieldData,
  fCashMarket,
  FiatKeys,
} from '@notional-finance/core-entities';
import {
  formatLeverageRatio,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  BaseTradeState,
  TradeState,
  VaultTradeState,
} from '@notional-finance/notionable';
import { RATE_DECIMALS, RATE_PRECISION } from '@notional-finance/util';
import {
  IntlShape,
  MessageDescriptor,
  defineMessages,
  useIntl,
} from 'react-intl';
import { useAllMarkets } from './use-market';
import { useFiat } from './use-user-settings';

interface DetailItem {
  label: React.ReactNode;
  value: {
    data: {
      displayValue?: string;
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
  intl: IntlShape,
  isLeverageOrRoll: boolean,
  yieldData: YieldData[]
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
  let apy: number;
  if (b.tokenType === 'fCash') {
    apy =
      ((fCashMarket.getImpliedInterestRate(realized, b) || 0) * 100) /
      RATE_PRECISION;
  } else {
    apy = yieldData.find((y) => y.token.id === b.tokenId)?.totalAPY || 0;
  }

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

  return [
    {
      label: intl.formatMessage(valueLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${
              isLeverageOrRoll
                ? b.toDisplayString(3, true)
                : b.abs().toDisplayString(3, true)
            } ${title}`,
            isNegative: isLeverageOrRoll ? b.isNegative() : false,
          },
        ],
      },
    },
    {
      label: intl.formatMessage(feeLabel, { title, caption }),
      // Fee: diff between PV and realized cash
      value: {
        data: [
          {
            displayValue: realized
              .abs()
              .toUnderlying()
              .sub(b.abs().toUnderlying())
              .toDisplayStringWithSymbol(3, true),
          },
        ],
      },
    },
    {
      // APY: for fCash look at implied rate, otherwise look at yield
      label: intl.formatMessage(apyLabel, { title, caption }),
      value: {
        data: [
          {
            displayValue: `${formatNumberAsPercent(apy, 3)}`,
            isNegative: apy < 0,
          },
        ],
      },
      showOnExpand: true,
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
              .toDisplayStringWithSymbol(3, true),
            isNegative: false,
          },
        ],
      },
      showOnExpand: true,
    },
  ];
}

export function useOrderDetails(state: BaseTradeState): OrderDetails {
  const {
    debtBalance,
    collateralBalance,
    netRealizedDebtBalance,
    netRealizedCollateralBalance,
    depositBalance,
    tradeType,
  } = state;
  const intl = useIntl();
  const { nonLeveragedYields } = useAllMarkets();
  const orderDetails: DetailItem[] = [];
  // Only show positive values if one of the values is defined
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

  if (depositBalance?.isPositive()) {
    orderDetails.push({
      label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
      value: {
        data: [
          {
            displayValue: depositBalance.toDisplayStringWithSymbol(3, true),
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
        intl,
        isLeverageOrRoll,
        nonLeveragedYields
      )
    );
  }

  if (collateralBalance?.isZero() === false && netRealizedCollateralBalance) {
    // Undo withdraw and convert token type here
    orderDetails.push(
      ...getOrderDetails(
        collateralBalance.unwrapVaultToken(),
        netRealizedCollateralBalance,
        intl,
        isLeverageOrRoll,
        nonLeveragedYields
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
              .toDisplayStringWithSymbol(3, true),
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
            displayValue: b.toUnderlying().toDisplayStringWithSymbol(3, true),
            isNegative: b.toUnderlying().isNegative(),
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
            displayValue: b.toUnderlying().toDisplayStringWithSymbol(3, true),
            isNegative: b.toUnderlying().isNegative(),
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
            displayValue: b.toUnderlying().toDisplayStringWithSymbol(3, true),
            isNegative: b.toUnderlying().isNegative(),
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
            displayValue: b.toUnderlying().toDisplayStringWithSymbol(3, true),
            isNegative: b.toUnderlying().isNegative(),
          },
        ],
      },
    };
  }

  throw Error('invalid asset key');
}

export function useTradeSummary(state: BaseTradeState) {
  const intl = useIntl();
  const baseCurrency = useFiat();
  const {
    depositBalance,
    netAssetBalance,
    netDebtBalance,
    debtBalance,
    collateralBalance,
    tradeType,
    canSubmit,
  } = state;

  // TODO: if underlying is not all the same the convert to fiat currency instead
  const underlying = netAssetBalance?.underlying || netDebtBalance?.underlying;
  if (!canSubmit || !underlying)
    return {
      summary: undefined,
      total: undefined,
    };

  // On leverage or roll, labels are slightly different
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

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
                .toDisplayStringWithSymbol(3, true),
              isNegative: false,
            },
            {
              displayValue: depositBalance
                .abs()
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(),
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
                3,
                true
              ),
              isNegative: false,
            },
            {
              displayValue: TokenBalance.zero(underlying)
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(),
              isNegative: false,
            },
          ],
        },
        isTotalRow: true,
      };

  const summary: DetailItem[] = [];
  if (isLeverageOrRoll) {
    if (depositBalance?.isPositive()) {
      // Deposit and Mint X
      summary.push(
        getTradeDetail(
          depositBalance,
          'Asset',
          'deposit',
          intl,
          collateralBalance.token
        )
      );
      // NOTE: technically net asset changes may occur here inside Leveraged Lend
      // or Leveraged Liquidity but currently they won't show in the trade summary
      // Borrow
      summary.push(getTradeDetail(debtBalance, 'Debt', 'none', intl));
      // Mint X - deposit
      summary.push(
        getTradeDetail(
          collateralBalance.toUnderlying().sub(depositBalance),
          'Asset',
          'none',
          intl,
          collateralBalance.token
        )
      );
    } else if (depositBalance?.isNegative()) {
      // NOTE: this is only going to be a withdraw vault transaction
      // Sell assets
      summary.push(
        getTradeDetail(collateralBalance.neg(), 'Asset', 'withdraw', intl)
      );
      // Repay debt
      summary.push(getTradeDetail(debtBalance, 'Debt', 'deposit', intl));

      /** NOTE: net asset and balance changes are used below here **/
    } else if (tradeType === 'Deleverage') {
      // In deleverage, the collateral and asset are reversed.
      summary.push(getTradeDetail(debtBalance, 'Asset', 'none', intl));
      summary.push(getTradeDetail(collateralBalance, 'Debt', 'repay', intl));
    } else if (tradeType === 'RollDebt') {
      // Asset to repay: this never changes signs
      summary.push(getTradeDetail(collateralBalance, 'Debt', 'repay', intl));

      if (netAssetBalance?.isZero() === false)
        // This only exists if the new debt maturity has fCash in it
        summary.push(getTradeDetail(netAssetBalance, 'Asset', 'none', intl));
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
        summary.push(getTradeDetail(netDebtBalance, 'Debt', 'none', intl));
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

  let feeValue = TokenBalance.zero(underlying);
  if (isLeverageOrRoll) {
    feeValue = collateralBalance
      .toUnderlying()
      .sub(depositBalance || TokenBalance.zero(underlying))
      .add(debtBalance.toUnderlying());
  } else if (collateralBalance && depositBalance) {
    feeValue = depositBalance
      .toUnderlying()
      .sub(collateralBalance.toUnderlying());
  } else if (debtBalance && depositBalance) {
    feeValue = depositBalance.toUnderlying().sub(debtBalance.toUnderlying());
  }

  // TODO: Deposit balances are emitted prior to collateral balances here and
  // so it causes the fee value to "toggle" a bit as the value changes. Ideally
  // we move the calculations into the observable so this is hidden
  summary.push({
    label: intl.formatMessage({ defaultMessage: 'Fees and Slippage' }),
    value: {
      data: [
        {
          displayValue: feeValue.toDisplayStringWithSymbol(3, true),
          isNegative: feeValue.isNegative(),
        },
      ],
    },
  });

  summary.push({ ...total });

  return { summary, total };
}

export function usePortfolioComparison(
  state: TradeState,
  fiat: FiatKeys = 'USD'
) {
  const { postTradeBalances, comparePortfolio } = state;
  const allTableData = comparePortfolio.map((p) => ({
    ...p,
    current: p.current.toFiat(fiat).toDisplayStringWithSymbol(3, true),
    updated: p.updated.toFiat(fiat).toDisplayStringWithSymbol(3, true),
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
  const healthFactor = _h
    ? {
        ..._h,
        label: intl.formatMessage({ defaultMessage: 'Health Factor' }),
        current: _h?.current?.toFixed(2) || 'No Risk',
        updated: _h?.updated?.toFixed(2) || 'No Risk',
      }
    : {
        label: intl.formatMessage({ defaultMessage: 'Health Factor' }),
        current: 'No Risk',
        changeType: 'none',
        greenOnArrowUp: true,
      };

  const liquidationPrices =
    liquidationPrice.map((p) => {
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
          ? p.current?.toFiat(baseCurrency).toDisplayStringWithSymbol(3) ||
            'No Risk'
          : p.current?.toUnderlying().toDisplayStringWithSymbol(3) || 'No Risk',
        updated: p.isPriceRisk
          ? p.updated?.toFiat(baseCurrency).toDisplayStringWithSymbol(3) ||
            'No Risk'
          : p.updated?.toUnderlying().toDisplayStringWithSymbol(3) || 'No Risk',
      };
    }) || [];

  return {
    onlyCurrent,
    tooRisky: postAccountRisk?.freeCollateral.isNegative() || false,
    priorAccountNoRisk:
      priorAccountRisk === undefined || priorAccountRisk?.healthFactor === null,
    postAccountNoRisk: postAccountRisk?.healthFactor === null,
    tableData: [healthFactor, ...liquidationPrices],
  };
}

export function useVaultLiquidationRisk(state: VaultTradeState) {
  const { priorAccountRisk, postAccountRisk } = state;
  const onlyCurrent = !postAccountRisk;
  const intl = useIntl();
  const baseCurrency = useFiat();

  const factors = [
    {
      label: intl.formatMessage({ defaultMessage: 'Assets' }),
      current: priorAccountRisk?.assets.toDisplayStringWithSymbol(3, true),
      updated: postAccountRisk?.assets.toDisplayStringWithSymbol(3, true),
      changeType: getChangeType(
        priorAccountRisk?.assets.toFloat(),
        postAccountRisk?.assets.toFloat()
      ),
      greenOnArrowUp: true,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'Debts' }),
      current: priorAccountRisk?.debts.toDisplayStringWithSymbol(3, true),
      updated: postAccountRisk?.debts.toDisplayStringWithSymbol(3, true),
      changeType: getChangeType(
        priorAccountRisk?.debts.toFloat(),
        postAccountRisk?.debts.toFloat()
      ),
      greenOnArrowUp: true,
    },
    {
      label: intl.formatMessage({ defaultMessage: 'Leverage Ratio' }),
      current: formatLeverageRatio(priorAccountRisk?.leverageRatio || 0),
      updated: formatLeverageRatio(postAccountRisk?.leverageRatio || 0),
      changeType: getChangeType(
        priorAccountRisk?.leverageRatio,
        postAccountRisk?.leverageRatio
      ),
      greenOnArrowUp: false,
    },
    // TODO: need to add the APY here
  ];

  const mergedLiquidationPrices = getLiquidationPrices(
    priorAccountRisk?.liquidationPrice || [],
    postAccountRisk?.liquidationPrice || [],
    baseCurrency
  ).filter((p) => p.isPriceRisk);

  return {
    onlyCurrent,
    tooRisky: postAccountRisk?.aboveMaxLeverageRatio || false,
    priorAccountNoRisk:
      priorAccountRisk === undefined ||
      priorAccountRisk?.leverageRatio === null,
    postAccountNoRisk:
      postAccountRisk === undefined || postAccountRisk?.leverageRatio === null,
    tableData: [...factors, ...mergedLiquidationPrices],
  };
}
