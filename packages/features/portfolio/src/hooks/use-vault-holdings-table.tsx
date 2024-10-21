import { useEffect, useState } from 'react';
import { Box, Theme, useTheme } from '@mui/material';
import {
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
  ChevronCell,
  LinkText,
  Body,
  H4,
  DisplayCell,
} from '@notional-finance/mui';
import {
  formatCryptoWithFiat,
  formatLeverageRatio,
  formatNumberAsAbbr,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import {
  formatHealthFactorValues,
  useLeverageBlock,
  useSelectedNetwork,
  useVaultHoldings,
  useAppState,
} from '@notional-finance/notionable-hooks';
import {
  TXN_HISTORY_TYPE,
  formatMaturity,
  PRIME_CASH_VAULT_MATURITY,
  pointsMultiple,
  Network,
  getDateString,
} from '@notional-finance/util';
import { ExpandedState } from '@tanstack/react-table';
import {
  FiatKeys,
  PointsLinks,
  Registry,
} from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import { TableActionRowWarning } from '../components';

const HealthFactorCell = ({ cell }) => {
  const theme = useTheme();
  const { column, getValue } = cell;
  const value = getValue();
  return (
    <Box
      sx={{
        color: value.textColor,
        display: 'flex',
        justifyContent: column.columnDef.textAlign,
        fontSize: '16px',
        width: theme.spacing(10),
      }}
    >
      {value.value}
    </Box>
  );
};

const VaultHoldingsColumns: DataTableColumn[] = [
  {
    header: (
      <FormattedMessage defaultMessage="Vault" description={'vault header'} />
    ),
    cell: MultiValueIconCell,
    accessorKey: 'vault',
    textAlign: 'left',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Health Factor"
        description={'Health Factor header'}
      />
    ),
    cell: HealthFactorCell,
    accessorKey: 'healthFactor',
    textAlign: 'left',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Market APY"
        description={'Market APY header'}
      />
    ),
    cell: DisplayCell,
    accessorKey: 'marketAPY',
    textAlign: 'right',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Present Value"
        description={'Present Value header'}
      />
    ),
    cell: MultiValueCell,
    accessorKey: 'presentValue',
    fontWeightBold: true,
    textAlign: 'right',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Amount Paid"
        description={'Amount Paid header'}
      />
    ),
    cell: MultiValueCell,
    accessorKey: 'amountPaid',
    fontWeightBold: true,
    textAlign: 'right',
    expandableTable: true,
  },
  {
    header: (
      <FormattedMessage
        defaultMessage="Total Earnings"
        description={'Total Earnings header'}
      />
    ),
    cell: MultiValueCell,
    accessorKey: 'totalEarnings',
    fontWeightBold: true,
    textAlign: 'right',
    expandableTable: true,
    showGreenText: true,
  },
  {
    header: '',
    cell: ChevronCell,
    accessorKey: 'chevron',
    textAlign: 'left',
    expandableTable: true,
  },
] as const;

function getVaultReinvestmentDate(
  network: Network,
  vaultAddress: string,
  reinvestmentCadence: number
) {
  try {
    const reinvestmentData =
      Registry.getAnalyticsRegistry().getVaultReinvestments(network)[
        vaultAddress
      ];
    return getDateString(reinvestmentData[0].timestamp + reinvestmentCadence);
  } catch (e) {
    return '';
  }
}

function getSpecificVaultInfo(
  v: ReturnType<typeof useVaultHoldings>[number],
  baseCurrency: FiatKeys,
  theme: Theme
): {
  subRowInfo: { label: React.ReactNode; value: React.ReactNode }[];
  totalEarnings:
    | string
    | {
        data: {
          displayValue: string;
          isNegative?: boolean;
          textColor?: string;
          toolTipContent?: MessageDescriptor;
        }[];
      };
  buttonBarData: { buttonText: React.ReactNode; link: string }[];
  warning: TableActionRowWarning | undefined;
  showRowWarning?: boolean;
} {
  const totalEarnings = formatCryptoWithFiat(baseCurrency, v.profit);

  // Point Farming Vaults
  if (v.vaultYield?.pointMultiples) {
    const pointsLink = PointsLinks[v.vault.network][v.vault.vaultAddress];
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
              {Object.keys(points)
                .map(
                  (k) =>
                    `${pointsMultiple(
                      points[k],
                      v.vault.leverageRatio() || 0
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
  } else if (v.vaultMetadata.rewardClaims) {
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
        ],
      },
      buttonBarData: [
        {
          buttonText: <FormattedMessage defaultMessage={'Claim Rewards'} />,
          link: `/vaults/${v.vault.network}/${v.vault.vaultAddress}/ClaimVaultRewards`,
        },
      ],
      warning: undefined,
    };
  } else if (v.vaultMetadata.vaultType === 'SingleSidedLP') {
    return {
      subRowInfo: [
        {
          label: (
            <FormattedMessage defaultMessage={'Time to Next Reinvestment'} />
          ),
          value: getVaultReinvestmentDate(
            v.vault.network,
            v.vault.vaultAddress,
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
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const [toggleOption, setToggleOption] = useState<number>(0);
  const isBlocked = useLeverageBlock();
  const theme = useTheme();
  const { baseCurrency } = useAppState();
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const claimableRewards = vaults.reduce(
    (acc, vault) => {
      if (
        vault.vaultMetadata.rewardClaims &&
        vault.vaultMetadata.rewardClaims.length > 0
      ) {
        vault.vaultMetadata.rewardClaims.forEach((claim) => {
          acc.rewardTokens.add(claim.symbol);
        });
        acc.vaults.push(vault.vault.vaultConfig.name);
      }
      return acc;
    },
    { rewardTokens: new Set<string>(), vaults: [] as string[] }
  );

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

  const vaultHoldingsData = vaults.map((vaultHolding) => {
    const {
      vault: v,
      denom,
      totalAPY,
      amountPaid,
      strategyAPY,
      borrowAPY,
    } = vaultHolding;
    const config = v.vaultConfig;
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
        value: formatNumberAsPercent(borrowAPY, 2),
      },
      {
        label: <FormattedMessage defaultMessage={'Strategy APY'} />,
        value: formatNumberAsPercent(strategyAPY, 2),
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
            {formatLeverageRatio(v.leverageRatio() || 0)}
            <Body sx={{ marginLeft: theme.spacing(1) }}>
              Max {formatLeverageRatio(v.maxLeverageRatio, 1)}
            </Body>
          </H4>
        ),
      },
      ...subRowInfo,
    ];

    return {
      vault: {
        symbol: formatTokenType(denom).icon,
        label: config.name,
        caption:
          v.maturity === PRIME_CASH_VAULT_MATURITY
            ? 'Open Term'
            : `Maturity: ${formatMaturity(v.maturity)}`,
      },
      // Assets and debts are shown on the overview page
      assets: formatCryptoWithFiat(baseCurrency, v.totalAssets()),
      debts: formatCryptoWithFiat(baseCurrency, v.totalDebt(), {
        isDebt: true,
      }),
      healthFactor: formatHealthFactorValues(v.healthFactor(), theme),
      presentValue: formatCryptoWithFiat(baseCurrency, v.netWorth()),
      totalEarnings,
      marketAPY: totalAPY ? formatNumberAsPercent(totalAPY) : undefined,
      amountPaid: formatCryptoWithFiat(baseCurrency, amountPaid),
      strategyAPY: {
        displayValue: formatNumberAsPercent(strategyAPY, 2),
        isNegative: strategyAPY && strategyAPY < 0,
      },
      borrowAPY: {
        displayValue: formatNumberAsPercent(borrowAPY, 2),
      },
      leverageRatio: formatLeverageRatio(v.leverageRatio() || 0),
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
            link: `/vaults/${network}/${v.vaultAddress}/Manage`,
          },
        ],
        txnHistory: `/portfolio/${network}/transaction-history?${new URLSearchParams(
          {
            txnHistoryType: TXN_HISTORY_TYPE.LEVERAGED_VAULT,
            assetOrVaultId: config.vaultAddress,
          }
        )}`,
      },
    };
  });

  useEffect(() => {
    const formattedExpandedRows = VaultHoldingsColumns.reduce(
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
  }, [expandedRows, setExpandedRows]);

  const totalRowData = vaults.reduce(
    (accumulator, vault) => {
      return {
        amountPaid:
          accumulator.amountPaid +
          vault.amountPaid.toFiat(baseCurrency).toFloat(),
        presentValue:
          accumulator.presentValue +
          vault.netWorth.toFiat(baseCurrency).toFloat(),
        totalEarnings:
          accumulator.totalEarnings +
          vault.profit.toFiat(baseCurrency).toFloat(),
        assets:
          accumulator.assets +
          vault.vault.totalAssets().toFiat(baseCurrency).toFloat(),
        debts:
          accumulator.debts +
          vault.vault.totalDebt().toFiat(baseCurrency).toFloat(),
      };
    },
    { amountPaid: 0, presentValue: 0, totalEarnings: 0, assets: 0, debts: 0 }
  );

  if (vaultHoldingsData.length > 0) {
    vaultHoldingsData.push({
      vault: {
        symbol: '',
        label: 'Total',
        caption: '',
      },
      healthFactor: { value: '', textColor: '' },
      marketAPY: '',
      amountPaid: formatNumberAsAbbr(totalRowData.amountPaid, 2, baseCurrency, {
        removeKAbbr: true,
      }),
      presentValue: formatNumberAsAbbr(
        totalRowData.presentValue,
        2,
        baseCurrency,
        { removeKAbbr: true }
      ),
      totalEarnings: formatNumberAsAbbr(
        totalRowData.totalEarnings,
        2,
        baseCurrency,
        { removeKAbbr: true }
      ),
      assets: formatNumberAsAbbr(totalRowData.assets, 2, baseCurrency, {
        removeKAbbr: true,
      }),
      debts: formatNumberAsAbbr(totalRowData.debts, 2, baseCurrency, {
        removeKAbbr: true,
      }),
      toolTipData: undefined,
      actionRow: undefined,
      isTotalRow: true,
    } as unknown as (typeof vaultHoldingsData)[number]);
  }

  return {
    vaultHoldingsColumns: VaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    initialState,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && vaults.length > 0,
    },
    claimableRewards:
      claimableRewards.rewardTokens.size > 0 ? claimableRewards : undefined,
  };
};
