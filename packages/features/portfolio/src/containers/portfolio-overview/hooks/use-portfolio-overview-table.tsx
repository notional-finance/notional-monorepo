import {
  FiatKeys,
  getNetworkModel,
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
  useGroupedHoldings,
  useLeverageBlock,
  usePendingPnLCalculation,
  usePortfolioHoldings,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  getDateString,
  leveragedYield,
  Network,
  pointsMultiple,
  PORTFOLIO_ACTIONS,
  PRIME_CASH_VAULT_MATURITY,
  TXN_HISTORY_TYPE,
} from '@notional-finance/util';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Box, Theme, useTheme } from '@mui/material';
import {
  Body,
  ChevronCell,
  DataTableColumn,
  H4,
  LinkText,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import {
  TableActionRowWarning,
  TotalEarningsTooltip,
} from '@notional-finance/portfolio-feature-shell/components';
import { TokenIcon } from '@notional-finance/icons';
import { useDetailedHoldingsTable } from '../../portfolio-holdings/use-detailed-holdings';
import { ExpandedState } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useGroupedHoldingsTable } from '../../portfolio-holdings/use-grouped-holdings';

interface OverviewTableRow {
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

function formatPortfolioHoldings(
  {
    balance,
    marketYield,
    amountPaid,
    earnings,
    hasMatured,
    impliedFixedRate,
    totalEarningsWithIncentives,
    totalAtMaturity,
    perIncentiveEarnings,
    isHighUtilization,
    entryPrice,
    manageTokenId,
    maturedTokenId,
    hasNToken,
  }: NonNullable<ReturnType<typeof usePortfolioHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): OverviewTableRow {
  const { icon, formattedTitle, titleWithMaturity, title } = formatTokenType(
    balance.token,
    balance.isNegative(),
    true
  );
  const network = balance.network;
  const marketApy = marketYield?.totalAPY;
  const noteIncentives = marketYield?.incentives?.find(
    (i) => i.symbol === 'NOTE'
  )?.incentiveAPY;
  const secondaryIncentives = marketYield?.incentives?.find(
    (i) => i.symbol !== 'NOTE'
  )?.incentiveAPY;
  const secondarySymbol = marketYield?.incentives?.find(
    (i) => i.symbol !== 'NOTE'
  )?.symbol;

  const buttonBarData: {
    buttonText: React.ReactNode;
    link: string;
  }[] = [];

  if (hasNToken) {
    buttonBarData.push({
      buttonText: <FormattedMessage defaultMessage={'Manage'} />,
      link: balance.isPositive()
        ? `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.CONVERT_ASSET}/${manageTokenId}/manage`
        : `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.ROLL_DEBT}/${manageTokenId}/manage`,
    });
  }

  if (balance.isPositive()) {
    buttonBarData.push({
      buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
      link: `/portfolio/${network}/holdings/${
        PORTFOLIO_ACTIONS.WITHDRAW
      }/${maturedTokenId}${
        isHighUtilization ? `?warning=${isHighUtilization}` : ''
      }`,
    });
  } else {
    buttonBarData.push({
      buttonText: <FormattedMessage defaultMessage={'Repay'} />,
      link: `/portfolio/${network}/holdings/${PORTFOLIO_ACTIONS.REPAY_DEBT}/${maturedTokenId}`,
    });
  }

  return {
    tokenId: balance.tokenId,
    isPending: !!pendingTokens?.includes(balance.token),
    asset: {
      symbol: icon,
      symbolBottom: '',
      label: formattedTitle,
      caption: titleWithMaturity,
    },
    marketApy: {
      data: [
        {
          displayValue: formatNumberAsPercentWithUndefined(marketApy, '-', 2),
          isNegative: false,
        },
        {
          displayValue:
            noteIncentives && secondaryIncentives
              ? `${formatNumberAsPercent(
                  noteIncentives
                )} NOTE, ${formatNumberAsPercent(
                  secondaryIncentives
                )} ${secondarySymbol}`
              : noteIncentives
              ? `${formatNumberAsPercent(noteIncentives)} NOTE`
              : balance.token.tokenType === 'fCash' &&
                !hasMatured &&
                impliedFixedRate !== undefined
              ? `${formatNumberAsPercent(impliedFixedRate)} APY at Maturity`
              : '',
          isNegative: false,
        },
      ],
    } as MultiRowTableData,
    amountPaid: formatCryptoWithFiat(baseCurrency, amountPaid, {
      isDebt: balance.isNegative(),
    }),
    presentValue: formatCryptoWithFiat(baseCurrency, balance.toUnderlying(), {
      isDebt: balance.isNegative(),
    }),
    totalEarnings: {
      data: [
        {
          displayValue: totalEarningsWithIncentives
            ? totalEarningsWithIncentives
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false)
            : '-',
          isNegative: totalEarningsWithIncentives
            ? totalEarningsWithIncentives.toFiat(baseCurrency).isNegative()
            : false,
        },
        {
          displayValue:
            balance.token.tokenType === 'fCash'
              ? `${totalAtMaturity?.toDisplayStringWithSymbol(
                  2,
                  true,
                  false
                )} at Maturity`
              : '',
          isNegative: false,
        },
      ],
    } as MultiRowTableData,
    toolTipData:
      perIncentiveEarnings.length > 0
        ? {
            perAssetEarnings: [
              {
                underlying: earnings?.toDisplayStringWithSymbol(2, true, false),
                baseCurrency: earnings
                  ?.toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true, false),
              },
              ...perIncentiveEarnings.map((i) => ({
                underlying: i.toDisplayStringWithSymbol(2, true, false),
                baseCurrency: i
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true, false),
              })),
            ],
          }
        : undefined,
    actionRow: {
      warning: hasMatured ? 'fCashMatured' : isHighUtilization,
      showRowWarning: !!isHighUtilization,
      subRowData: [
        {
          label: <FormattedMessage defaultMessage={'Balance'} />,
          value: `${balance.abs().toDisplayString(4, true)} ${title}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Entry Price'} />,
          value: entryPrice
            ? entryPrice.toDisplayStringWithSymbol(4, true, false)
            : '-',
        },
        {
          label: <FormattedMessage defaultMessage={'Current Price'} />,
          value: `${TokenBalance.unit(balance.token)
            .toUnderlying()
            .toDisplayStringWithSymbol(4, false, false)}`,
        },
      ],
      buttonBarData,
      txnHistory: `/portfolio/${
        balance.network
      }/transaction-navigate?${new URLSearchParams({
        txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
        assetOrVaultId: balance.token.id,
      })}`,
    },
  };
}

function formatCaption(asset: TokenBalance, debt: TokenBalance) {
  if (asset.tokenType === 'nToken' && debt.tokenType === 'PrimeDebt') {
    return 'Variable Borrow';
  } else if (asset.tokenType === 'nToken' && debt.tokenType === 'fCash') {
    return `Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else if (asset.tokenType === 'fCash' && debt.tokenType === 'PrimeDebt') {
    return `Fixed Lend: ${formatMaturity(asset.maturity)}, Variable Borrow`;
  } else if (asset.tokenType === 'PrimeCash' && debt.tokenType === 'fCash') {
    return `Variable Lend, Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else if (asset.tokenType === 'fCash' && debt.tokenType === 'fCash') {
    return `Fixed Lend: ${formatMaturity(
      asset.maturity
    )}, Fixed Borrow: ${formatMaturity(debt.maturity)}`;
  } else {
    return undefined;
  }
}

function formatLeveragedPosition(
  {
    asset: {
      balance: asset,
      marketYield: assetYield,
      perIncentiveEarnings,
      isHighUtilization,
    },
    debt: { balance: debt },
    hasMatured,
    leverageRatio,
    presentValue,
    borrowAPY,
    totalEarnings,
    totalLeveragedApy,
    amountPaid,
  }: NonNullable<ReturnType<typeof useGroupedHoldings>>[number],
  pendingTokens: TokenDefinition[] | undefined,
  baseCurrency: FiatKeys
): OverviewTableRow {
  const { icon } = formatTokenType(asset.token);
  const { icon: debtIcon } = formatTokenType(debt.token);
  const network = asset.network;
  const underlying = asset.underlying;
  const noteAPY = assetYield?.incentives?.find(
    (i) => i.symbol === 'NOTE'
  )?.incentiveAPY;
  const noteIncentives =
    noteAPY !== undefined
      ? leveragedYield(noteAPY, 0, leverageRatio)
      : undefined;
  const secondaryAPY = assetYield?.incentives?.find(
    (i) => i.symbol !== 'NOTE'
  )?.incentiveAPY;
  const secondarySymbol = assetYield?.incentives?.find(
    (i) => i.symbol !== 'NOTE'
  )?.symbol;
  const secondaryIncentives =
    secondaryAPY !== undefined && secondarySymbol
      ? leveragedYield(secondaryAPY, 0, leverageRatio)
      : undefined;

  return {
    tokenId: asset.tokenId,
    isPending: !!pendingTokens?.find(
      (t) => t.id === asset.tokenId || t.id === debt.tokenId
    ),
    asset: {
      symbol: icon,
      symbolBottom: debtIcon,
      label:
        asset.tokenType === 'nToken'
          ? `Leveraged ${asset.underlying.symbol} Liquidity`
          : `Leveraged ${asset.underlying.symbol} Lend`,
      caption: formatCaption(asset, debt) || '',
    },
    marketApy: {
      data: [
        {
          displayValue: formatNumberAsPercentWithUndefined(
            totalLeveragedApy,
            '-',
            2
          ),
          isNegative: false,
        },
        {
          displayValue:
            noteIncentives && secondaryIncentives
              ? `${formatNumberAsPercent(
                  noteIncentives
                )} NOTE, ${formatNumberAsPercent(
                  secondaryIncentives
                )} ${secondarySymbol}`
              : noteIncentives
              ? `${formatNumberAsPercent(noteIncentives)} NOTE`
              : '',
          isNegative: false,
        },
      ],
    },
    amountPaid: formatCryptoWithFiat(
      baseCurrency,
      amountPaid
    ) as MultiRowTableData,
    presentValue: formatCryptoWithFiat(
      baseCurrency,
      presentValue
    ) as MultiRowTableData,
    totalEarnings: {
      data: [
        {
          displayValue: totalEarnings
            ? totalEarnings
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false)
            : '-',
          isNegative: totalEarnings
            ? totalEarnings.toFiat(baseCurrency).isNegative()
            : false,
        },
        {
          displayValue: '',
          isNegative: false,
        },
      ],
    },
    toolTipData:
      perIncentiveEarnings.length > 0
        ? {
            perAssetEarnings: [
              {
                underlying: totalEarnings?.toDisplayStringWithSymbol(
                  2,
                  true,
                  false
                ),
                baseCurrency: totalEarnings
                  ?.toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true, false),
              },
              ...perIncentiveEarnings.map((i: TokenBalance) => ({
                underlying: i.toDisplayStringWithSymbol(2, true, false),
                baseCurrency: i
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true, false),
              })),
            ],
          }
        : undefined,
    actionRow: {
      warning: hasMatured ? 'fCashMatured' : isHighUtilization,
      showRowWarning: !!isHighUtilization,
      subRowData: [
        {
          label: <FormattedMessage defaultMessage={'Borrow APY'} />,
          value: formatNumberAsPercentWithUndefined(borrowAPY, '-'),
        },
        {
          label: <FormattedMessage defaultMessage={'Strategy APY'} />,
          value: formatNumberAsPercentWithUndefined(assetYield?.totalAPY, '-'),
        },
        {
          label: <FormattedMessage defaultMessage={'Leverage Ratio'} />,
          value: formatLeverageRatio(leverageRatio),
        },
      ],
      buttonBarData: [
        {
          buttonText: <FormattedMessage defaultMessage={'Manage'} />,
          link: `/liquidity-leveraged/${network}/Manage/${underlying.symbol}`,
        },
        {
          buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
          link: `/liquidity-leveraged/${network}/Withdraw/${underlying.symbol}${
            isHighUtilization ? `?warning=${isHighUtilization}` : ''
          }`,
        },
      ],
      txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
        {
          txnHistoryType: TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS,
          assetOrVaultId: asset.token.id,
          debtId: debt.token.id || '',
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
      caption:
        vaultShares.maturity === PRIME_CASH_VAULT_MATURITY
          ? 'Open Term'
          : `Maturity: ${formatMaturity(vaultShares.maturity)}`,
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
    vaultDebt.unwrapVaultToken().token,
    vaultDebt.isNegative(),
    true
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
      vaultDebt.unwrapVaultToken().token.tokenType === 'fCash' &&
      impliedFixedRate
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
    presentValue: formatCryptoWithFiat(
      baseCurrency,
      vaultDebt.unwrapVaultToken().toUnderlying(),
      {
        isDebt: true,
      }
    ),
    totalEarnings: formatCryptoWithFiat(baseCurrency, debtEarnings),
    actionRow: {
      buttonBarData: tableRow.actionRow.buttonBarData,
      txnHistory: tableRow.actionRow.txnHistory,
      subRowData: [
        {
          label: <FormattedMessage defaultMessage={'Balance'} />,
          value: `${vaultDebt
            .unwrapVaultToken()
            .abs()
            .toDisplayString(4, true, false)} ${title}`,
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
            .unwrapVaultToken()
            .toUnderlying()
            .toDisplayStringWithSymbol(4, false, false)}`,
        },
      ],
    },
  };

  return [dividerRow(name), assets, debts];
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

function getVaultReinvestmentDate(
  network: Network,
  vaultAddress: string,
  reinvestmentCadence: number
) {
  try {
    const reinvestmentData =
      getNetworkModel(network).getVaultReinvestment(vaultAddress);
    return reinvestmentData
      ? getDateString(reinvestmentData[0].timestamp + reinvestmentCadence)
      : '';
  } catch (e) {
    return '';
  }
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
  } else if (v.vaultMetadata.vaultType === 'SingleSidedLP_AutoReinvest') {
    return {
      subRowInfo: [
        {
          label: (
            <FormattedMessage defaultMessage={'Time to Next Reinvestment'} />
          ),
          value: getVaultReinvestmentDate(
            v.network,
            v.vaultAddress,
            v.vaultMetadata.reinvestmentCadence
          ),
        },
      ],
      totalEarnings,
      buttonBarData: [],
      warning: undefined,
    };
  } else if (
    v.vaultMetadata.vaultType === 'PendlePT' &&
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

function insertDebtDivider(arr: any[]) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].asset.label.includes('Borrow')) {
      arr.splice(i, 0, {
        asset: {
          symbol: '',
          symbolBottom: '',
          label: 'DEBT POSITIONS',
          caption: '',
        },
        marketApy: {
          data: [
            {
              displayValue: '',
              isNegative: false,
            },
          ],
        },
        amountPaid: '',
        presentValue: '',
        earnings: '',
        toolTipData: undefined,
        actionRow: undefined,
        tokenId: ' ',
        isTotalRow: true,
        isDividerRow: true,
      });
      break;
    }
  }
  return arr;
}

export const usePortfolioOverviewTable = (showGrouped: boolean) => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const leveragedNTokenHoldings = useGroupedHoldings(network);
  // NOTE: this returns grouped holdings for vaults
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );
  const { isMobileView } = useAppStore();
  const isBlocked = useLeverageBlock();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [toggleOption, setToggleOption] = useState<number>(0);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const pendingTokenData = usePendingPnLCalculation(network);
  const { detailedHoldings, totalHoldingsRow } =
    useDetailedHoldingsTable(baseCurrency);
  const { groupedRows, groupedTokens } = useGroupedHoldingsTable(baseCurrency);

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
    .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
  const debt = filteredHoldings
    .filter((h) => h.balance.isNegative())
    .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));

  const groupedHoldings = [
    ...groupedRows,
    ...detailedHoldings.filter(
      ({ tokenId }) => !groupedTokens.includes(tokenId)
    ),
  ];

  const vaultHoldingsData =
    vaults?.map((vaultHolding) => {
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
      } = vaultHolding;
      const {
        subRowInfo,
        totalEarnings,
        buttonBarData,
        warning,
        showRowWarning,
      } = getSpecificVaultInfo(vaultHolding, baseCurrency, theme);

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
                alignItems: 'center',
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
          caption:
            maturity === PRIME_CASH_VAULT_MATURITY
              ? 'Open Term'
              : `Maturity: ${formatMaturity(maturity)}`,
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
        marketApy: apyData?.totalAPY
          ? formatNumberAsPercent(apyData.totalAPY)
          : '',
        amountPaid: formatCryptoWithFiat(baseCurrency, amountPaid),
        actionRow: {
          warning,
          showRowWarning,
          subRowData,
          buttonBarData: [
            ...buttonBarData,
            {
              buttonText: (
                <FormattedMessage defaultMessage={'Manage / Withdraw'} />
              ),
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
    }) || [];

  let leverage: OverviewTableRow[];
  if (showGrouped) {
    leverage = [
      ...(vaultHoldingsData || []),
      ...(leveragedNTokenHoldings?.map((h) =>
        formatLeveragedPosition(h, pendingTokens, baseCurrency)
      ) || []),
    ];
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
          formatPortfolioHoldings(asset, pendingTokens, baseCurrency),
          formatPortfolioHoldings(debt, pendingTokens, baseCurrency),
        ];
      }) || []),
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

  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: <FormattedMessage defaultMessage="Asset" />,
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
        expandableTable: true,
        width: theme.spacing(37.5),
      },
      {
        header: <FormattedMessage defaultMessage="Market APY" />,
        cell: MultiValueCell,
        accessorKey: 'marketApy',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
        width: theme.spacing(25),
      },
      {
        header: <FormattedMessage defaultMessage="Amount Paid" />,
        cell: MultiValueCell,
        accessorKey: 'amountPaid',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
      },
      {
        header: <FormattedMessage defaultMessage="Present Value" />,
        cell: MultiValueCell,
        accessorKey: 'presentValue',
        fontWeightBold: true,
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total Earnings" />,
        cell: MultiValueCell,
        ToolTip: TotalEarningsTooltip,
        accessorKey: 'earnings',
        textAlign: 'right',
        fontWeightBold: true,
        expandableTable: true,
        showLoadingSpinner: true,
        showGreenText: true,
      },
      {
        header: '',
        cell: ChevronCell,
        accessorKey: 'chevron',
        textAlign: 'left',
        expandableTable: true,
      },
    ],
    [theme]
  );

  useEffect(() => {
    const formattedExpandedRows = Columns.reduce(
      (accumulator, _value, index) => {
        return { ...accumulator, [index]: index === 0 ? true : false };
      },
      {}
    );

    if (
      expandedRows === null &&
      JSON.stringify(formattedExpandedRows) !== '{}'
    ) {
      setExpandedRows(formattedExpandedRows);
    }
  }, [expandedRows, setExpandedRows, Columns]);

  const portfolioHoldingsData =
    toggleOption === 0 && !isBlocked && groupedRows.length > 0
      ? groupedHoldings
      : detailedHoldings;

  return {
    rows: [
      ...leverage,
      earn.length > 0 && leverage.length > 0
        ? dividerRow('EARN POSITIONS')
        : undefined,
      ...earn,
      debt.length > 0 && (earn.length > 0 || leverage.length > 0)
        ? dividerRow('DEBT POSITIONS')
        : undefined,
      ...debt,
    ].filter((r) => r !== undefined),
    hasLeverage:
      (leveragedNTokenHoldings || []).length > 0 ||
      vaultHoldingsData?.length > 0,
    leverage,
    earn,
    debt,

    showVaultHoldingsTable: vaultHoldingsData && vaultHoldingsData.length > 0,
    vaultHoldingsData,

    portfolioHoldingsColumns: Columns,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && groupedRows.length > 0,
    },
    portfolioHoldingsData: [
      ...insertDebtDivider(portfolioHoldingsData),
      isMobileView ? undefined : totalHoldingsRow,
    ].filter((item) => item !== undefined),
    pendingTokenData,
    setExpandedRows,
    initialState,
  };
};
