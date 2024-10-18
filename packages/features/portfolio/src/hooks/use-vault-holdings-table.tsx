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
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import {
  formatHealthFactorValues,
  useLeverageBlock,
  useSelectedNetwork,
  useTotalVaultHoldings,
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
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { ExpandedState } from '@tanstack/react-table';
import {
  FiatKeys,
  getNetworkModel,
  PointsLinks,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { TokenIcon } from '@notional-finance/icons';
import { TableActionRowWarning } from '../components';
import { useAppStore } from '@notional-finance/notionable';

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
  theme: Theme,
  navigate: NavigateFunction
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
  buttonBarData: { buttonText: React.ReactNode; callback: () => void }[];
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
              {Object.keys(points)
                .map(
                  (k) =>
                    `${pointsMultiple(points[k], v.leverageRatio || 0).toFixed(
                      2
                    )}x ${k}`
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
          callback: () => {
            navigate(
              `/vaults/${v.network}/${v.vaultAddress}/ClaimVaultRewards`
            );
          },
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
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const [toggleOption, setToggleOption] = useState<number>(0);
  const isBlocked = useLeverageBlock();
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const navigate = useNavigate();
  const network = useSelectedNetwork();
  const vaults = useVaultHoldings(network);
  const totalVaultHoldings = useTotalVaultHoldings(network);

  const claimableRewards = (vaults || []).reduce(
    (acc, vault) => {
      if (
        vault.vaultMetadata.rewardClaims &&
        vault.vaultMetadata.rewardClaims.length > 0
      ) {
        vault.vaultMetadata.rewardClaims.forEach((claim) => {
          acc.rewardTokens.add(claim.symbol);
        });
        acc.vaults.push(vault.name);
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

  const vaultHoldingsData = (vaults || []).map((vaultHolding) => {
    const {
      vaultAddress,
      name,
      maturity,
      underlying,
      totalAPY,
      amountPaid,
      strategyAPY,
      borrowAPY,
      leverageRatio,
      maxLeverageRatio,
      totalAssets,
      totalDebt,
      healthFactor,
      netWorth,
    } = vaultHolding;
    const {
      subRowInfo,
      totalEarnings,
      buttonBarData,
      warning,
      showRowWarning,
    } = getSpecificVaultInfo(vaultHolding, baseCurrency, theme, navigate);

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
            {formatLeverageRatio(leverageRatio || 0)}
            <Body sx={{ marginLeft: theme.spacing(1) }}>
              Max {formatLeverageRatio(maxLeverageRatio, 1)}
            </Body>
          </H4>
        ),
      },
      ...subRowInfo,
    ];

    return {
      vault: {
        symbol: formatTokenType(underlying as TokenDefinition).icon,
        label: name,
        caption:
          maturity === PRIME_CASH_VAULT_MATURITY
            ? 'Open Term'
            : `Maturity: ${formatMaturity(maturity)}`,
      },
      // Assets and debts are shown on the overview page
      assets: formatCryptoWithFiat(baseCurrency, totalAssets),
      debts: formatCryptoWithFiat(baseCurrency, totalDebt, {
        isDebt: true,
      }),
      healthFactor: formatHealthFactorValues(healthFactor, theme),
      presentValue: formatCryptoWithFiat(baseCurrency, netWorth),
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
      leverageRatio: formatLeverageRatio(leverageRatio || 0),
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
            callback: () => {
              navigate(`/vaults/${network}/${vaultAddress}/Manage`);
            },
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

  if (totalVaultHoldings) {
    vaultHoldingsData.push({
      vault: {
        symbol: '',
        label: 'Total',
        caption: '',
      },
      healthFactor: { value: '', textColor: '' },
      marketAPY: '',
      amountPaid: totalVaultHoldings.amountPaid.toDisplayStringWithSymbol(
        2,
        true,
        false
      ),
      presentValue: totalVaultHoldings.presentValue.toDisplayStringWithSymbol(
        2,
        true,
        false
      ),
      totalEarnings: totalVaultHoldings.totalEarnings.toDisplayStringWithSymbol(
        2,
        true,
        false
      ),
      assets: totalVaultHoldings.assets.toDisplayStringWithSymbol(
        2,
        true,
        false
      ),
      debts: totalVaultHoldings.debts.toDisplayStringWithSymbol(2, true, false),
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
      showToggle: !isBlocked && vaults && vaults.length > 0,
    },
    claimableRewards:
      claimableRewards.rewardTokens.size > 0 ? claimableRewards : undefined,
  };
};
