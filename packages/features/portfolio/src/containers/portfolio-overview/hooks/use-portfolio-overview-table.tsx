import {
  FiatKeys,
  PointsLinks,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
  MultiRowTableData,
} from '@notional-finance/helpers';
import {
  formatHealthFactorValues,
  useAppStore,
  usePendingPnLCalculation,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  pointsMultiple,
  PRIME_CASH_VAULT_MATURITY,
  TXN_HISTORY_TYPE,
} from '@notional-finance/util';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Box, Theme, useTheme } from '@mui/material';
import { Body, H4, LinkText } from '@notional-finance/mui';
import { TokenIcon } from '@notional-finance/icons';
import { TableActionRowWarning } from '../../../components/table-action-row/table-action-row';
import { useState } from 'react';

export interface OverviewTableRow {
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
  marketApy: MultiRowTableData;
  amountPaid: MultiRowTableData;
  presentValue: MultiRowTableData;
  totalEarnings: MultiRowTableData;
  toolTipData?: {
    perAssetEarnings: {
      underlying: string | undefined;
      baseCurrency: string | undefined;
    }[];
  };
  healthFactor?: {
    value: string;
    textColor: string;
  };
  actionRow: {
    warning?: string;
    showRowWarning?: boolean;
    subRowData: {
      label: React.ReactNode;
      value: React.ReactNode;
    }[];
    buttonBarData: {
      buttonText: React.ReactNode;
      link: string;
    }[];
    txnHistory: string;
  };
}

function dividerRow(label: string) {
  return {
    asset: {
      symbol: '',
      symbolBottom: '',
      label,
      caption: '',
    },
    marketApy: '',
    amountPaid: '',
    presentValue: '',
    totalEarnings: '',
    toolTipData: undefined,
    actionRow: {
      warning: '',
      showRowWarning: false,
      subRowData: [],
      buttonBarData: [],
      txnHistory: '',
    },
    tokenId: ' ',
    isTotalRow: true,
    isPending: false,
    isDividerRow: true,
  };
}

function getSpecificVaultInfo(
  v: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  baseCurrency: FiatKeys,
  theme: Theme
): {
  subRowInfo: { label: React.ReactNode; value: React.ReactNode }[];
  totalEarnings: MultiRowTableData;
  buttonBarData: { buttonText: React.ReactNode; link: string }[];
  warning: TableActionRowWarning | undefined;
  showRowWarning?: boolean;
} {
  const totalEarnings = formatCryptoWithFiat(baseCurrency, v.profit);

  // Point Farming Vaults
  if (v.vaultYield?.pointMultiples) {
    const pointsLink = PointsLinks[v.network][v.vaultAddress];
    const points = v.vaultYield?.pointMultiples;

    if (typeof totalEarnings === 'object' && totalEarnings.data) {
      totalEarnings.data[0]['toolTipContent'] = defineMessage({
        defaultMessage:
          'Most of the APY in this strategy is driven by points and point earnings are not shown here. Check the partner protocol dashboard to track accrued points.',
        description: 'points tooltip',
      });
    }

    return {
      subRowInfo: [
        {
          label: <FormattedMessage defaultMessage={'Points Boost'} />,
          value: (
            <LinkText
              // Make the lineHeight match H4 here
              sx={{
                lineHeight: `${16 * 1.4}px`,
                ':hover': { cursor: 'pointer' },
              }}
              href={pointsLink}
            >
              {Array.from(points.keys())
                .map(
                  (k) =>
                    `${pointsMultiple(
                      points.get(k) || 0,
                      v.leverageRatio || 0
                    ).toFixed(2)}x ${k}`
                )
                .join(', ')}
            </LinkText>
          ),
        },
      ],
      totalEarnings,
      buttonBarData: [],
      warning: 'pointsWarning',
    };
  } else if (v.vaultMetadata.rewardClaims.length > 0) {
    // Reward Claiming Vaults
    return {
      subRowInfo: [
        {
          label: <FormattedMessage defaultMessage={'Claimable Rewards'} />,
          value: (
            <Box sx={{ display: 'flex', gap: theme.spacing(1) }}>
              {v.vaultMetadata.rewardClaims.map((claim) => (
                <Box
                  sx={{
                    display: 'flex',
                    gap: theme.spacing(1),
                    alignItems: 'center',
                    marginRight: theme.spacing(1),
                  }}
                  key={claim.symbol}
                >
                  <TokenIcon symbol={claim.symbol} size={'small'} />
                  <H4>{claim.toDisplayString(3, true, false)}</H4>
                </Box>
              ))}
            </Box>
          ),
        },
      ],
      totalEarnings: {
        data: [
          {
            displayValue: 'N/A',
            textColor: theme.palette.typography.main,
            toolTipContent: defineMessage({
              defaultMessage:
                'This vault requires claiming reward tokens directly. We are unable to calculate the dollar value at this time. Claim rewards in the drawer below.',
              description: 'reward token tooltip',
            }),
          },
          {
            displayValue: '',
          },
        ],
      },
      buttonBarData: [
        {
          buttonText: <FormattedMessage defaultMessage={'Claim Rewards'} />,
          link: `/vaults/${v.network}/${v.vaultAddress}/ClaimVaultRewards`,
        },
      ],
      warning: undefined,
    };
  } else if (
    v.vaultMetadata.strategyType === 'PendlePT' &&
    v.vaultMetadata.isExpired
  ) {
    return {
      subRowInfo: [],
      totalEarnings,
      buttonBarData: [],
      warning: 'pendleExpired',
      showRowWarning: true,
    };
  }

  return {
    warning: undefined,
    subRowInfo: [],
    totalEarnings,
    buttonBarData: [],
  };
}

function formatVaultHoldings(
  vaultHolding: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys,
  theme: Theme
) {
  const {
    vaultAddress,
    name,
    maturity,
    underlying,
    amountPaid,
    apyData,
    leverageRatio,
    maxLeverageRatio,
    totalAssets,
    totalDebt,
    healthFactor,
    netWorth,
    vaultShares,
    vaultDebt,
    network,
  } = vaultHolding;
  const { subRowInfo, totalEarnings, buttonBarData, warning, showRowWarning } =
    getSpecificVaultInfo(vaultHolding, baseCurrency, theme);

  const subRowData: { label: React.ReactNode; value: React.ReactNode }[] = [
    {
      label: <FormattedMessage defaultMessage={'Borrow APY'} />,
      value: formatNumberAsPercent(apyData?.debtAPY || 0, 2),
    },
    {
      label: <FormattedMessage defaultMessage={'Strategy APY'} />,
      value: formatNumberAsPercent(apyData?.assetAPY || 0, 2),
    },
    {
      label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
      value: (
        <H4
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          {formatLeverageRatio(leverageRatio)}
          <Body sx={{ marginLeft: theme.spacing(1) }}>
            Max {formatLeverageRatio(maxLeverageRatio, 1)}
          </Body>
        </H4>
      ),
    },
    ...subRowInfo,
  ];

  return {
    asset: {
      symbol: underlying,
      symbolBottom: '',
      label: name,
      caption: maturity ? `Maturity: ${formatMaturity(maturity)}` : 'Open Term',
    },
    vaultAddress,
    tokenId: vaultShares.tokenId,
    isPending: !!pendingTokens?.find(
      (t) => t.id === vaultShares.tokenId || t.id === vaultDebt.tokenId
    ),
    // Assets and debts are shown on the overview page
    assets: formatCryptoWithFiat(baseCurrency, totalAssets),
    debts: formatCryptoWithFiat(baseCurrency, totalDebt, {
      isDebt: true,
    }),
    healthFactor: formatHealthFactorValues(healthFactor, theme),
    presentValue: formatCryptoWithFiat(baseCurrency, netWorth),
    totalEarnings,
    marketApy: apyData?.totalAPY ? formatNumberAsPercent(apyData.totalAPY) : '',
    amountPaid: formatCryptoWithFiat(baseCurrency, amountPaid),
    actionRow: {
      warning,
      showRowWarning,
      subRowData,
      buttonBarData: [
        ...buttonBarData,
        {
          buttonText: <FormattedMessage defaultMessage={'Manage / Withdraw'} />,
          link: `/vaults/${network}/${vaultAddress}/Manage`,
        },
      ],
      txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
        {
          txnHistoryType: TXN_HISTORY_TYPE.LEVERAGED_VAULT,
          assetOrVaultId: vaultAddress,
        }
      )}`,
    },
  };
}

function formatDetailedVaultHoldings(
  {
    vaultShares,
    name,
    vaultDebt,
    underlying,
    assetEarnings,
    debtEarnings,
    assetAmountPaid,
    debtAmountPaid,
    assetEntryPrice,
    debtEntryPrice,
    apyData,
    impliedFixedRate,
  }: NonNullable<ReturnType<typeof useVaultHoldings>>[number],
  tableRow: OverviewTableRow,
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
) {
  const assets: OverviewTableRow = {
    asset: {
      symbol: underlying,
      symbolBottom: '',
      label: name,
      caption: vaultShares.maturity
        ? `Maturity: ${formatMaturity(vaultShares.maturity || 0)}`
        : 'Open Term',
    },
    healthFactor: tableRow.healthFactor,
    tokenId: vaultShares.tokenId,
    isPending: !!pendingTokens?.find((t) => t.id === vaultShares.tokenId),
    marketApy: apyData?.assetAPY ? formatNumberAsPercent(apyData.assetAPY) : '',
    amountPaid: formatCryptoWithFiat(baseCurrency, assetAmountPaid),
    presentValue: formatCryptoWithFiat(
      baseCurrency,
      vaultShares.toUnderlying()
    ),
    totalEarnings: formatCryptoWithFiat(baseCurrency, assetEarnings),
    actionRow: {
      buttonBarData: tableRow.actionRow.buttonBarData,
      txnHistory: tableRow.actionRow.txnHistory,
      subRowData: [
        {
          label: <FormattedMessage defaultMessage={'Balance'} />,
          value: `${vaultShares.toDisplayString(4, true)} Vault Shares`,
        },
        {
          label: <FormattedMessage defaultMessage={'Entry Price'} />,
          value: assetEntryPrice
            ? assetEntryPrice.toDisplayStringWithSymbol(4, true, false)
            : '-',
        },
        {
          label: <FormattedMessage defaultMessage={'Current Price'} />,
          value: `${TokenBalance.unit(vaultShares.token)
            .toUnderlying()
            .toDisplayStringWithSymbol(4, false, false)}`,
        },
      ],
    },
  };

  const { icon, formattedTitle, titleWithMaturity, title } = formatTokenType(
    vaultDebt.token
  );

  const debts: OverviewTableRow = {
    asset: {
      symbol: icon,
      symbolBottom: '',
      label: formattedTitle,
      caption: titleWithMaturity,
    },
    tokenId: vaultDebt.tokenId,
    isPending: !!pendingTokens?.find((t) => t.id === vaultDebt.tokenId),
    marketApy:
      vaultDebt.token.maturity && impliedFixedRate
        ? {
            data: [
              {
                displayValue: formatNumberAsPercentWithUndefined(
                  apyData?.debtAPY,
                  '-',
                  2
                ),
                isNegative: false,
              },
              {
                displayValue: `${formatNumberAsPercent(
                  impliedFixedRate
                )} APY at Maturity`,
                isNegative: false,
              },
            ],
          }
        : apyData?.debtAPY
        ? formatNumberAsPercent(apyData.debtAPY)
        : '',
    amountPaid: formatCryptoWithFiat(baseCurrency, debtAmountPaid, {
      isDebt: true,
    }),
    presentValue: formatCryptoWithFiat(baseCurrency, vaultDebt.toUnderlying(), {
      isDebt: true,
    }),
    totalEarnings: formatCryptoWithFiat(baseCurrency, debtEarnings),
    actionRow: {
      buttonBarData: tableRow.actionRow.buttonBarData,
      txnHistory: tableRow.actionRow.txnHistory,
      subRowData: [
        {
          label: <FormattedMessage defaultMessage={'Balance'} />,
          value: `${vaultDebt.abs().toDisplayString(4, true, false)} ${title}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Entry Price'} />,
          value: debtEntryPrice
            ? debtEntryPrice.abs().toDisplayStringWithSymbol(4, true, false)
            : '-',
        },
        {
          label: <FormattedMessage defaultMessage={'Current Price'} />,
          value: `${TokenBalance.unit(vaultDebt.token)
            .toUnderlying()
            .toDisplayStringWithSymbol(4, false, false)}`,
        },
      ],
    },
  };

  return [dividerRow(name), assets, debts];
}

export const usePortfolioOverviewTable = (showGrouped: boolean) => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  // NOTE: this returns grouped holdings for vaults
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );
  const [toggleOption, setToggleOption] = useState<number>(0);
  const pendingTokenData = usePendingPnLCalculation(network);

  const vaultHoldingsData =
    vaults?.map((vaultHolding) =>
      formatVaultHoldings(vaultHolding, pendingTokens, baseCurrency, theme)
    ) || [];

  let leverage: OverviewTableRow[];
  if (showGrouped) {
    leverage = [...(vaultHoldingsData || [])];
  } else {
    leverage = [
      ...(vaults || []).flatMap((v) => {
        const tableRow = vaultHoldingsData?.find(
          (l) => l.vaultAddress === v.vaultAddress
        );
        if (!tableRow) return [];

        return formatDetailedVaultHoldings(
          v,
          tableRow,
          pendingTokens,
          baseCurrency
        );
      }),
    ];
  }

  const toggleData = [
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'center',
        width: theme.spacing(11),
      }}
    >
      <FormattedMessage defaultMessage="Default" />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        display: 'flex',
        justifyContent: 'center',
        width: theme.spacing(11),
      }}
    >
      <FormattedMessage defaultMessage="Detailed" />
    </Box>,
  ];

  return {
    rows: leverage.filter((r) => r !== undefined),
    hasLeverage: vaultHoldingsData?.length > 0,
    leverage,
    showVaultHoldingsTable: vaultHoldingsData && vaultHoldingsData.length > 0,
    vaultHoldingsData,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: leverage.length > 0,
    },
    pendingTokenData,
  };
};
