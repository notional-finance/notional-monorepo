import {
  FiatKeys,
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
  useAppStore,
  useGroupedHoldings,
  usePendingPnLCalculation,
  usePortfolioHoldings,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { useVaultHoldingsTable } from '../../../hooks';
import {
  formatMaturity,
  leveragedYield,
  PORTFOLIO_ACTIONS,
  PRIME_CASH_VAULT_MATURITY,
  TXN_HISTORY_TYPE,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

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

export const usePortfolioOverviewTable = (
  showGrouped: boolean
): {
  rows: OverviewTableRow[];
  hasLeverage: boolean;
  leverage: OverviewTableRow[];
  earn: OverviewTableRow[];
  debt: OverviewTableRow[];
} => {
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network);
  const leveragedNTokenHoldings = useGroupedHoldings(network);
  // NOTE: this returns grouped holdings for vaults
  const { vaultHoldingsData } = useVaultHoldingsTable();
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );

  const groupedTokens =
    leveragedNTokenHoldings?.flatMap(({ asset, debt }) => [
      asset.balance.tokenId,
      debt.balance.tokenId,
    ]) || [];

  const filteredHoldings =
    holdings?.filter((h) => !groupedTokens.includes(h.balance.tokenId)) || [];
  const earn = filteredHoldings
    .filter((h) => h.balance.isPositive())
    .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
  const debt = filteredHoldings
    .filter((h) => h.balance.isNegative())
    .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));

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
  };
};
