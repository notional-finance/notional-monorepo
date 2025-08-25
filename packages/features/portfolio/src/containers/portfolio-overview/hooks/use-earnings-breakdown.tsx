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
    vaultDebt.token
  );
  const vaultCell = {
    symbol: underlying,
    symbolBottom: '',
    label: name,
    caption: maturity ? `Maturity: ${formatMaturity(maturity)}` : 'Open Term',
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
