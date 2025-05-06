import {
  useSelectedNetwork,
  usePortfolioHoldings,
  useGroupedHoldings,
  useAppStore,
  usePendingPnLCalculation,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  formatCryptoWithFiat,
  formatTokenType,
  MultiRowTableData,
} from '@notional-finance/helpers';
import { FiatKeys, TokenDefinition } from '@notional-finance/core-entities';
import { formatCaption } from './use-portfolio-overview-table';
import {
  formatMaturity,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';

interface EarningsBreakdownRow {
  isTotalRow?: boolean;
  tokenId: string;
  isPending: boolean;
  isDividerRow?: boolean;
  vaultAddress?: string;
  asset: {
    symbol: string;
    symbolBottom: string;
    label: string;
    caption: string;
  };
  incentivesEarnings: MultiRowTableData;
  accruedInterest: MultiRowTableData;
  marketPNL: MultiRowTableData;
  feesPaid: MultiRowTableData;
  totalEarnings: MultiRowTableData;
  toolTipData?: {
    perAssetEarnings: {
      underlying: string | undefined;
      baseCurrency: string | undefined;
    }[];
  };
}

function dividerRow(label: string): EarningsBreakdownRow {
  return {
    asset: {
      symbol: '',
      symbolBottom: '',
      label,
      caption: '',
    },
    incentivesEarnings: '',
    accruedInterest: '',
    marketPNL: '',
    feesPaid: '',
    totalEarnings: '',
    toolTipData: undefined,
    tokenId: ' ',
    isTotalRow: true,
    isPending: false,
    isDividerRow: true,
  };
}

function formatPortfolioEarnings(
  {
    balance,
    totalIncentiveEarnings,
    totalInterestAccrual,
    feesPaid,
    totalEarningsWithIncentives,
    marketProfitLoss,
    perIncentiveEarnings,
  }: NonNullable<ReturnType<typeof usePortfolioHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): EarningsBreakdownRow {
  const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
    balance.token,
    balance.isNegative(),
    true
  );

  return {
    tokenId: balance.tokenId,
    isPending: !!pendingTokens?.includes(balance.token),
    asset: {
      symbol: icon,
      symbolBottom: '',
      label: formattedTitle,
      caption: titleWithMaturity,
    },
    incentivesEarnings: formatCryptoWithFiat(
      baseCurrency,
      totalIncentiveEarnings
    ),
    toolTipData:
      perIncentiveEarnings.length > 0
        ? {
            perAssetEarnings: perIncentiveEarnings?.map((i) => ({
              underlying: i.toDisplayStringWithSymbol(2),
              baseCurrency: i.toFiat(baseCurrency).toDisplayStringWithSymbol(2),
            })),
          }
        : undefined,
    accruedInterest: formatCryptoWithFiat(baseCurrency, totalInterestAccrual),
    marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
    feesPaid: formatCryptoWithFiat(baseCurrency, feesPaid),
    totalEarnings: formatCryptoWithFiat(
      baseCurrency,
      totalEarningsWithIncentives
    ),
  };
}

function formatLeveragedEarnings(
  {
    asset: {
      balance: asset,
      perIncentiveEarnings,
      totalIncentiveEarnings,
      totalEarningsWithIncentives,
    },
    debt: { balance: debt },
    totalInterestAccrual,
    totalILAndFees,
    marketProfitLoss,
  }: NonNullable<ReturnType<typeof useGroupedHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): EarningsBreakdownRow {
  const { icon } = formatTokenType(asset.token);
  const debtData = formatTokenType(debt.token);
  const underlying = asset.underlying;

  return {
    tokenId: asset.tokenId,
    isPending: !!pendingTokens?.includes(asset.token),
    asset: {
      symbol: icon,
      symbolBottom: debtData?.icon,
      label:
        asset.tokenType === 'nToken'
          ? `Leveraged ${underlying.symbol} Liquidity`
          : `Leveraged ${underlying.symbol} Lend`,
      caption: formatCaption(asset, debt) || '',
    },
    incentivesEarnings: formatCryptoWithFiat(
      baseCurrency,
      totalIncentiveEarnings
    ),
    toolTipData:
      perIncentiveEarnings.length > 0
        ? {
            perAssetEarnings: perIncentiveEarnings?.map((i) => ({
              underlying: i.toDisplayStringWithSymbol(2),
              baseCurrency: i.toFiat(baseCurrency).toDisplayStringWithSymbol(2),
            })),
          }
        : undefined,
    accruedInterest: formatCryptoWithFiat(baseCurrency, totalInterestAccrual),
    marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
    feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
    totalEarnings: formatCryptoWithFiat(
      baseCurrency,
      totalEarningsWithIncentives
    ),
  };
}

function formatGroupedVaultEarnings(
  {
    underlying,
    name,
    maturity,
    totalInterestAccrual,
    totalILAndFees,
    marketProfitLoss,
    profit,
    vaultShares,
  }: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): EarningsBreakdownRow {
  return {
    tokenId: vaultShares.tokenId,
    isPending: !!pendingTokens?.includes(vaultShares.token),
    asset: {
      symbol: underlying,
      symbolBottom: '',
      label: name,
      caption:
        maturity === PRIME_CASH_VAULT_MATURITY
          ? 'Open Term'
          : `Maturity: ${formatMaturity(maturity)}`,
    },
    incentivesEarnings: '',
    accruedInterest: formatCryptoWithFiat(baseCurrency, totalInterestAccrual),
    marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
    feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
    totalEarnings: formatCryptoWithFiat(baseCurrency, profit),
  };
}

function formatDetailedVaultEarnings(
  {
    vaultShares,
    vaultDebt,
    underlying,
    name,
    maturity,
    assetMarketPnL,
    assetInterestAccrual,
    assetFeesPaid,
    assetEarnings,
    debtMarketPnL,
    debtInterestAccrual,
    debtFeesPaid,
    debtEarnings,
  }: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): EarningsBreakdownRow[] {
  const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
    vaultDebt.unwrapVaultToken().token,
    true
  );
  const vaultCell = {
    symbol: underlying,
    symbolBottom: '',
    label: name,
    caption:
      maturity === PRIME_CASH_VAULT_MATURITY
        ? 'Open Term'
        : `Maturity: ${formatMaturity(maturity)}`,
  };

  return [
    // Vault Shares
    {
      tokenId: vaultShares.tokenId,
      isPending: !!pendingTokens?.includes(vaultShares.token),
      asset: vaultCell,
      incentivesEarnings: '',
      accruedInterest: formatCryptoWithFiat(baseCurrency, assetInterestAccrual),
      marketPNL: formatCryptoWithFiat(baseCurrency, assetMarketPnL),
      feesPaid: formatCryptoWithFiat(baseCurrency, assetFeesPaid),
      totalEarnings: formatCryptoWithFiat(baseCurrency, assetEarnings),
    },
    // Vault Debt
    {
      asset: {
        symbol: icon,
        symbolBottom: '',
        label: formattedTitle,
        caption: titleWithMaturity,
      },
      tokenId: vaultDebt.tokenId,
      isPending: !!pendingTokens?.includes(vaultDebt.token),
      incentivesEarnings: '',
      accruedInterest: formatCryptoWithFiat(baseCurrency, debtInterestAccrual),
      marketPNL: formatCryptoWithFiat(baseCurrency, debtMarketPnL),
      feesPaid: formatCryptoWithFiat(baseCurrency, debtFeesPaid),
      totalEarnings: formatCryptoWithFiat(baseCurrency, debtEarnings),
    },
  ];
}

export function useEarningsBreakdown(
  showGrouped: boolean
): EarningsBreakdownRow[] {
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const leveragedNTokenHoldings = useGroupedHoldings(network);
  // NOTE: this returns grouped holdings for vaults
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );

  const filteredHoldings =
    holdings?.filter(
      (h) =>
        !(
          leveragedNTokenHoldings?.flatMap(({ asset, debt }) => [
            asset.balance.tokenId,
            debt.balance.tokenId,
          ]) || []
        ).includes(h.balance.tokenId)
    ) || [];
  const earn = filteredHoldings
    .filter((h) => h.balance.isPositive())
    .map((h) => formatPortfolioEarnings(h, pendingTokens, baseCurrency));
  const debt = filteredHoldings
    .filter((h) => h.balance.isNegative())
    .map((h) => formatPortfolioEarnings(h, pendingTokens, baseCurrency));

  let leverage: EarningsBreakdownRow[];
  if (showGrouped) {
    const vaultEarnings = vaults?.map((v) =>
      formatGroupedVaultEarnings(v, pendingTokens, baseCurrency)
    );
    leverage = [
      ...(vaultEarnings || []),
      ...(leveragedNTokenHoldings?.map((h) =>
        formatLeveragedEarnings(h, pendingTokens, baseCurrency)
      ) || []),
    ];
  } else {
    leverage = [
      ...(vaults?.flatMap((v) =>
        formatDetailedVaultEarnings(v, pendingTokens, baseCurrency)
      ) || []),
      ...(leveragedNTokenHoldings?.flatMap((l) => {
        const asset = holdings?.find(
          (h) => h.balance.tokenId === l.asset.balance.tokenId
        );
        const debt = holdings?.find(
          (h) => h.balance.tokenId === l.debt.balance.tokenId
        );
        if (!asset || !debt) return [];

        return [
          dividerRow(`LEVERAGED ${asset.balance.underlying.symbol} LIQUIDITY`),
          formatPortfolioEarnings(asset, pendingTokens, baseCurrency),
          formatPortfolioEarnings(debt, pendingTokens, baseCurrency),
        ];
      }) || []),
    ];
  }

  return [
    ...leverage,
    earn.length > 0 && leverage.length > 0
      ? dividerRow('EARN POSITIONS')
      : undefined,
    ...earn,
    debt.length > 0 && (earn.length > 0 || leverage.length > 0)
      ? dividerRow('DEBT POSITIONS')
      : undefined,
    ...debt,
  ].filter((r) => r !== undefined);
}
