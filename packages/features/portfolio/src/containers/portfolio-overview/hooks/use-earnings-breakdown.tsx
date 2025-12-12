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
    vaultIcon,
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
      symbolBottom: vaultIcon || '',
      label: name,
      caption: '',
    },
    incentivesEarnings: '-',
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
    vaultIcon,
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
  const vaultCell = {
    symbol: vaultIcon || '',
    symbolBottom: '',
    label: name,
    caption: '',
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
  const { formattedTitle } = formatTokenType(vaultDebt.token);

  const debt: EarningsBreakdownRow = {
    asset: {
      symbol: underlying,
      symbolBottom: '',
      label: formattedTitle,
      caption: '',
    },
    tokenId: vaultDebt.tokenId,
    isPending: !!pendingTokens?.includes(vaultDebt.token),
    incentivesEarnings: '-',
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
