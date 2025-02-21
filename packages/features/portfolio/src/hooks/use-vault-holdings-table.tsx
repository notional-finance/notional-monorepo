import { Box, Theme, useTheme } from '@mui/material';
import { LinkText, Body, H4 } from '@notional-finance/mui';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatNumberAsPercent,
  MultiRowTableData,
} from '@notional-finance/helpers';
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  formatHealthFactorValues,
  usePendingPnLCalculation,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';
import {
  TXN_HISTORY_TYPE,
  formatMaturity,
  PRIME_CASH_VAULT_MATURITY,
  pointsMultiple,
  Network,
  getDateString,
} from '@notional-finance/util';
import {
  FiatKeys,
  getNetworkModel,
  PointsLinks,
} from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import { TableActionRowWarning } from '../components';
import { useAppStore } from '@notional-finance/notionable-hooks';


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

export const useVaultHoldingsTable = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const pendingTokens = usePendingPnLCalculation(network)?.flatMap(
    ({ tokens }) => tokens
  );

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

  return {
    showVaultHoldingsTable: vaultHoldingsData && vaultHoldingsData.length > 0,
    vaultHoldingsData,
  };
};
