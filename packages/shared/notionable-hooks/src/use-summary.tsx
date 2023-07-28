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
import {
  RATE_DECIMALS,
  RATE_PRECISION,
  zipByKeyToArray,
} from '@notional-finance/util';
import {
  IntlShape,
  MessageDescriptor,
  defineMessages,
  useIntl,
} from 'react-intl';
import { useAllMarkets } from './use-market';
import { useAccountDefinition } from './use-account';
import { AccountRiskProfile } from '@notional-finance/risk-engine';

interface DetailItem {
  label: React.ReactNode;
  value: string;
  showOnExpand?: boolean;
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
    apy =
      yieldData.find(
        (y) => y.leveraged === undefined && y.token.id === b.tokenId
      )?.totalAPY || 0;
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
      value: isLeverageOrRoll
        ? b.toDisplayStringWithSymbol(3, true)
        : b.abs().toDisplayStringWithSymbol(3, true),
    },
    {
      label: intl.formatMessage(feeLabel, { title, caption }),
      // Fee: diff between PV and realized cash
      value: realized
        .abs()
        .toUnderlying()
        .sub(b.abs().toUnderlying())
        .toDisplayStringWithSymbol(3, true),
    },
    {
      // APY: for fCash look at implied rate, otherwise look at yield
      label: intl.formatMessage(apyLabel, { title, caption }),
      value: `${formatNumberAsPercent(apy, 3)}`,
      showOnExpand: true,
    },
    {
      // Price: realized cash / total units
      label: intl.formatMessage(priceLabel, { title, caption }),
      value: realized
        .abs()
        .toUnderlying()
        .divInRatePrecision(b.abs().toUnderlying().scaleTo(RATE_DECIMALS))
        .toDisplayStringWithSymbol(3, true),
      showOnExpand: true,
    },
  ];
}

export function useOrderDetails(state: BaseTradeState): DetailItem[] {
  const {
    debtBalance,
    collateralBalance,
    netRealizedDebtBalance,
    netRealizedCollateralBalance,
    depositBalance,
  } = state;
  const intl = useIntl();
  const { allYields } = useAllMarkets();
  const orderDetails: DetailItem[] = [];
  // Only show positive values if one of the values is defined
  const isLeverageOrRoll = !!debtBalance && !!collateralBalance;

  if (depositBalance?.isPositive()) {
    orderDetails.push({
      label: OrderDetailLabels.amountToWallet,
      value: depositBalance.toDisplayStringWithSymbol(3, true),
    });
  }

  // NOTE: if sign changes occur, they don't get marked here
  if (debtBalance?.isZero() === false && netRealizedDebtBalance)
    orderDetails.concat(
      ...getOrderDetails(
        debtBalance.unwrapVaultToken(),
        netRealizedDebtBalance,
        intl,
        isLeverageOrRoll,
        allYields
      )
    );

  if (collateralBalance?.isZero() === false && netRealizedCollateralBalance)
    orderDetails.concat(
      ...getOrderDetails(
        collateralBalance.unwrapVaultToken(),
        netRealizedCollateralBalance,
        intl,
        isLeverageOrRoll,
        allYields
      )
    );

  if (depositBalance?.isNegative()) {
    orderDetails.push({
      label: OrderDetailLabels.amountFromWallet,
      value: depositBalance.neg().toDisplayStringWithSymbol(3, true),
    });
  }

  return orderDetails;
}

const TradeSummaryLabels = {
  VaultShare: defineMessages({
    deposit: { defaultMessage: 'Deposit and Mint Vault Shares ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Vault Shares ({caption})' },
    none: { defaultMessage: 'Mint Vault Shares ({caption})' },
  }),
  fCashLend: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Fixed ({caption})' },
    withdraw: { defaultMessage: 'Withdraw Fixed Lend ({caption})' },
    none: { defaultMessage: 'Lend Fixed ({caption})' },
  }),
  PrimeCash: defineMessages({
    deposit: { defaultMessage: 'Deposit and Lend Variable' },
    withdraw: { defaultMessage: 'Withdraw Variable Lend' },
    none: { defaultMessage: 'Lend Variable' },
  }),
  nToken: defineMessages({
    deposit: { defaultMessage: 'Deposit and Provide Liquidity' },
    withdraw: { defaultMessage: 'Withdraw Liquidity' },
    none: { defaultMessage: 'Provide Liquidity' },
  }),
  fCashDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Fixed Debt ({caption})' },
    withdraw: { defaultMessage: 'Borrow Fixed ({caption})' },
    none: { defaultMessage: 'Borrow Fixed ({caption})' },
  }),
  PrimeDebt: defineMessages({
    deposit: { defaultMessage: 'Deposit and Repay Variable Debt' },
    withdraw: { defaultMessage: 'Borrow Variable' },
    none: { defaultMessage: 'Borrow Variable' },
  }),
};

function getTradeDetail(
  b: TokenBalance,
  assetOrDebt: 'Asset' | 'Debt',
  typeKey: 'deposit' | 'withdraw' | 'none',
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
      value: b.toUnderlying().toDisplayStringWithSymbol(3, true),
    };
  } else if (tokenType === 'PrimeCash') {
    // net asset balances should always be returned in prime cash
    return {
      label: intl.formatMessage(
        TradeSummaryLabels[assetOrDebt === 'Asset' ? 'PrimeCash' : 'PrimeDebt'][
          typeKey
        ]
      ),
      value: b.toUnderlying().toDisplayStringWithSymbol(3, true),
    };
  } else if (tokenType === 'PrimeDebt') {
    // This is for prime cash vault maturities
    return {
      label: intl.formatMessage(TradeSummaryLabels['PrimeDebt'][typeKey]),
      value: b.toUnderlying().toDisplayStringWithSymbol(3, true),
    };
  } else if (tokenType === 'VaultShare' || tokenType === 'nToken') {
    return {
      label: intl.formatMessage(
        TradeSummaryLabels[tokenType][b.isNegative() ? 'withdraw' : typeKey],
        {
          caption,
        }
      ),
      value: b.toUnderlying().toDisplayStringWithSymbol(3, true),
    };
  }

  throw Error('invalid asset key');
}

export function useTradeSummary(state: BaseTradeState) {
  const intl = useIntl();
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
        value: depositBalance.abs().toUnderlying().toDisplayString(3, true),
      }
    : {
        // TODO: how to determine to and from wallet when zero?
        label: intl.formatMessage(OrderDetailLabels.amountFromWallet),
        value: TokenBalance.zero(underlying).toDisplayString(3, true),
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
    } else if (tradeType === 'RollDebt') {
      // Asset to repay: this never changes signs
      summary.push(getTradeDetail(collateralBalance, 'Asset', 'none', intl));

      if (netAssetBalance?.isZero() === false)
        // This only exists if the new debt maturity has fCash in it
        summary.push(getTradeDetail(netAssetBalance, 'Asset', 'none', intl));
      // New borrow balance
      if (netDebtBalance?.isZero() === false)
        summary.push(getTradeDetail(netDebtBalance, 'Debt', 'none', intl));
    } else if (tradeType === 'ConvertAsset') {
      // Asset to sell: this sign never changes
      summary.push(getTradeDetail(debtBalance, 'Debt', 'none', intl));

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
    if (netAssetBalance?.isZero() === false)
      summary.push(getTradeDetail(netAssetBalance, 'Asset', 'deposit', intl));
  } else if (depositBalance?.isNegative()) {
    if (netAssetBalance?.isZero() === false)
      summary.push(
        getTradeDetail(netAssetBalance.neg(), 'Asset', 'withdraw', intl)
      );
    if (netDebtBalance?.isZero() === false)
      summary.push(
        getTradeDetail(netDebtBalance.neg(), 'Debt', 'withdraw', intl)
      );
  } else {
    return { summary: undefined, total: undefined };
  }

  let feeValue = TokenBalance.zero(underlying);
  if (isLeverageOrRoll) {
    feeValue = collateralBalance.toUnderlying().add(debtBalance.toUnderlying());
  } else if (collateralBalance && depositBalance) {
    feeValue = depositBalance.toUnderlying().sub(collateralBalance.toUnderlying());
  } else if (debtBalance && depositBalance) {
    feeValue = depositBalance.toUnderlying().sub(debtBalance.toUnderlying());
  }

  summary.push({
    label: intl.formatMessage({ defaultMessage: 'Fees and Slippage' }),
    value: feeValue.toDisplayStringWithSymbol(3, true),
  });

  return { summary, total };
}

type ChangeType = 'increase' | 'decrease' | 'none' | 'cleared';
interface CompareData {
  label: string;
  current: string;
  updated: string;
  changeType: ChangeType;
}

export function usePortfolioComparison(
  state: BaseTradeState,
  fiat: FiatKeys = 'USD'
) {
  const { account } = useAccountDefinition();
  const { collateralBalance, debtBalance } = state;
  const onlyCurrent = !collateralBalance && !debtBalance;

  const tableData: CompareData[] | undefined = account?.balances.map((b) => {
    const { titleWithMaturity } = formatTokenType(b.token);
    const current = b.toFiat(fiat).toDisplayStringWithSymbol(3, true);
    if (b.tokenId === collateralBalance?.tokenId) {
      return {
        label: titleWithMaturity,
        current,
        updated: b
          .add(collateralBalance)
          .toFiat(fiat)
          .toDisplayStringWithSymbol(3, true),
        changeType: collateralBalance.isZero()
          ? 'none'
          : collateralBalance.isPositive()
          ? 'increase'
          : 'decrease',
      };
    } else if (b.tokenId === debtBalance?.tokenId) {
      return {
        label: titleWithMaturity,
        current,
        updated: b
          .add(debtBalance)
          .toFiat(fiat)
          .toDisplayStringWithSymbol(3, true),
        changeType: debtBalance.isZero()
          ? 'none'
          : debtBalance.isPositive()
          ? 'increase'
          : 'decrease',
      };
    } else {
      return {
        label: titleWithMaturity,
        current,
        updated: current,
        changeType: 'none',
      };
    }
  });

  return { onlyCurrent, tableData };
}

function getChangeType(
  current: number | undefined | null,
  updated: number | undefined | null
) {
  // TODO: need to show something else here for health factor
  if (!current && updated) return 'increase';
  else if (!updated && current) return 'cleared';
  else if (updated && current)
    return updated === current
      ? 'none'
      : updated > current
      ? 'increase'
      : 'decrease';
  else return 'none';
}

function getLiquidationPrices(
  prior: ReturnType<AccountRiskProfile['getAllLiquidationPrices']>,
  post: ReturnType<AccountRiskProfile['getAllLiquidationPrices']>
) {
  return zipByKeyToArray(
    prior,
    post,
    (t) => `${t.debt.id}:${t.collateral.id}`
  ).map(([current, updated]) => {
    let collateralTitle: string;
    let debtTitle: string;
    let isCrossCurrency: boolean;
    if (current) {
      collateralTitle = formatTokenType(current.collateral).titleWithMaturity;
      debtTitle = formatTokenType(current.debt).titleWithMaturity;
      isCrossCurrency = current.riskExposure?.isCrossCurrencyRisk || false;
    } else if (updated) {
      collateralTitle = formatTokenType(updated.collateral).titleWithMaturity;
      debtTitle = formatTokenType(updated.debt).titleWithMaturity;
      isCrossCurrency = updated.riskExposure?.isCrossCurrencyRisk || false;
    } else {
      throw Error('invalid liquidation prices');
    }

    return {
      label: `${
        isCrossCurrency ? `${collateralTitle}/${debtTitle}` : collateralTitle
      } Liquidation Price`,
      current: current?.price.toDisplayString(3, true) || '-',
      updated: updated?.price.toDisplayString(3, true) || '-',
      changeType: getChangeType(
        current?.price.toFloat(),
        updated?.price.toFloat()
      ),
      greenOnArrowUp: false,
    };
  });
}

export function usePortfolioLiquidationRisk(state: TradeState) {
  const { priorAccountRisk, postAccountRisk } = state;
  const onlyCurrent = !postAccountRisk;
  const healthFactor = {
    label: 'Health Factor',
    current: priorAccountRisk?.healthFactor?.toFixed(3) || '-',
    updated: postAccountRisk?.healthFactor?.toFixed(3) || '-',
    changeType: getChangeType(
      priorAccountRisk?.healthFactor,
      postAccountRisk?.healthFactor
    ),
    greenOnArrowUp: true,
  };

  const mergedLiquidationPrices = getLiquidationPrices(
    priorAccountRisk?.liquidationPrice || [],
    postAccountRisk?.liquidationPrice || []
  );

  return {
    onlyCurrent,
    priorAccountNoRisk:
      priorAccountRisk === undefined || priorAccountRisk?.healthFactor === null,
    postAccountNoRisk: postAccountRisk?.healthFactor === null,
    tableData: [healthFactor, ...mergedLiquidationPrices],
  };
}

export function useVaultLiquidationRisk(state: VaultTradeState) {
  const { priorAccountRisk, postAccountRisk } = state;
  const onlyCurrent = !postAccountRisk;
  const healthFactor = {
    label: 'Leverage Ratio',
    current: formatLeverageRatio(priorAccountRisk?.leverageRatio || 0),
    updated: formatLeverageRatio(postAccountRisk?.leverageRatio || 0),
    changeType: getChangeType(
      priorAccountRisk?.leverageRatio,
      postAccountRisk?.leverageRatio
    ),
    greenOnArrowUp: false,
  };

  const mergedLiquidationPrices = getLiquidationPrices(
    priorAccountRisk?.liquidationPrice || [],
    postAccountRisk?.liquidationPrice || []
  );

  return {
    onlyCurrent,
    tableData: [healthFactor, ...mergedLiquidationPrices],
  };
}
