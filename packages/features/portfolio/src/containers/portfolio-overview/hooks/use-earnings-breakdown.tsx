import {
  useSelectedNetwork,
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
import { formatMaturity } from '@notional-finance/util';

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
    // This keeps the style of the row thin
    isTotalRow: true,
    isPending: false,
    isDividerRow: true,
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
    totalEarnings,
    vaultShares,
    incentiveEarnings,
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
      caption: maturity ? `Maturity: ${formatMaturity(maturity)}` : 'Open Term',
    },
    incentivesEarnings: '',
    accruedInterest: formatCryptoWithFiat(baseCurrency, totalInterestAccrual),
    marketPNL: formatCryptoWithFiat(baseCurrency, marketProfitLoss),
    feesPaid: formatCryptoWithFiat(baseCurrency, totalILAndFees),
    totalEarnings: formatCryptoWithFiat(baseCurrency, totalEarnings),
    toolTipData:
      incentiveEarnings && incentiveEarnings.length > 0
        ? {
            perAssetEarnings: incentiveEarnings.map(({ adjustedClaimed }) => ({
              underlying: adjustedClaimed.toDisplayStringWithSymbol(
                4,
                true,
                false
              ),
              baseCurrency: undefined,
            })),
          }
        : undefined,
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
    incentiveEarnings,
  }: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): EarningsBreakdownRow[] {
  const { icon, formattedTitle, titleWithMaturity } = formatTokenType(
    vaultDebt.token
  );
  const vaultCell = {
    symbol: underlying,
    symbolBottom: '',
    label: name,
    caption: maturity ? `Maturity: ${formatMaturity(maturity)}` : 'Open Term',
  };

  const shares: EarningsBreakdownRow = {
    tokenId: vaultShares.tokenId,
    isPending: !!pendingTokens?.includes(vaultShares.token),
    asset: vaultCell,
    incentivesEarnings: '',
    accruedInterest: formatCryptoWithFiat(baseCurrency, assetInterestAccrual),
    marketPNL: formatCryptoWithFiat(baseCurrency, assetMarketPnL),
    feesPaid: formatCryptoWithFiat(baseCurrency, assetFeesPaid),
    totalEarnings: formatCryptoWithFiat(baseCurrency, assetEarnings),
    toolTipData:
      incentiveEarnings && incentiveEarnings.length > 0
        ? {
            perAssetEarnings: incentiveEarnings.map(({ adjustedClaimed }) => ({
              underlying: adjustedClaimed.toDisplayStringWithSymbol(
                4,
                true,
                false
              ),
              baseCurrency: undefined,
            })),
          }
        : undefined,
  };

  // Short circuit if there are no debts
  if (vaultDebt.isZero()) return [shares];

  const debt: EarningsBreakdownRow = {
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
  };

  return [dividerRow(name), shares, debt];
}

export function useEarningsBreakdown(
  showGrouped: boolean
): EarningsBreakdownRow[] {
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  // NOTE: this returns grouped holdings for vaults
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );

  let leverage: EarningsBreakdownRow[];
  if (showGrouped) {
    leverage =
      vaults?.map((v) =>
        formatGroupedVaultEarnings(v, pendingTokens, baseCurrency)
      ) || [];
  } else {
    leverage =
      vaults?.flatMap((v) =>
        formatDetailedVaultEarnings(v, pendingTokens, baseCurrency)
      ) || [];
  }

  return leverage.filter((r) => r !== undefined);
}
