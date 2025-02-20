import {
  FiatKeys,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
  formatNumberAsPercentWithUndefined,
  formatTokenType,
} from '@notional-finance/helpers';
import {
  useAppStore,
  useGroupedHoldings,
  usePendingPnLCalculation,
  usePortfolioHoldings,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_ACTIONS, TXN_HISTORY_TYPE } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

type MultiRowTableData =
  | {
      data: [
        {
          displayValue: string;
          isNegative: boolean;
        },
        {
          displayValue: string;
          isNegative: boolean;
        }
      ];
    }
  | string;

interface OverviewTableRow {
  isTotalRow?: boolean;
  tokenId: string;
  isPending: boolean;
  isDividerRow?: boolean;
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
  earningsToolTip?: {
    perAssetEarnings: {
      underlying: string;
      baseCurrency: string;
    }[];
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
) {
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
    amountPaid: formatCryptoWithFiat(
      baseCurrency,
      amountPaid
    ) as MultiRowTableData,
    presentValue: formatCryptoWithFiat(baseCurrency, balance.toUnderlying(), {
      isDebt: balance.isNegative(),
    }) as MultiRowTableData,
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
          label: <FormattedMessage defaultMessage={'Amount'} />,
          value: `${balance.toDisplayString(4, true)} ${title}`,
        },
        {
          label: <FormattedMessage defaultMessage={'Entry Price'} />,
          value: entryPrice
            ? entryPrice.toDisplayStringWithSymbol(2, true, false)
            : '-',
        },
        {
          label: <FormattedMessage defaultMessage={'Current Price'} />,
          value: `${TokenBalance.unit(balance.token)
            .toUnderlying()
            .toDisplayString(4)} ${balance.underlying.symbol}`,
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
} => {
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  const holdings = usePortfolioHoldings(network) || [];
  const leveragedNTokenHoldings = useGroupedHoldings(network) || [];
  // const vaultHoldings = useVaultHoldings(network) || [];
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );

  let earn: OverviewTableRow[];
  let debt: OverviewTableRow[];
  const leverage: OverviewTableRow[] = [];

  if (showGrouped) {
    const groupedTokens = leveragedNTokenHoldings.flatMap(({ asset, debt }) => [
      asset.balance.tokenId,
      debt.balance.tokenId,
    ]);
    const filteredHoldings = holdings.filter(
      (h) => !groupedTokens.includes(h.balance.tokenId)
    );
    earn = filteredHoldings
      .filter((h) => h.balance.isPositive())
      .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
    debt = filteredHoldings
      .filter((h) => h.balance.isNegative())
      .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
  } else {
    earn = holdings
      .filter((h) => h.balance.isPositive())
      .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
    debt = holdings
      .filter((h) => h.balance.isNegative())
      .map((h) => formatPortfolioHoldings(h, pendingTokens, baseCurrency));
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

    hasLeverage: leverage.length > 0,
  };
};
