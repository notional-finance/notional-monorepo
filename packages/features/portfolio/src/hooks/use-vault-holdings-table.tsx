import { useMemo, useEffect, useState } from 'react';
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
import { FormattedMessage, defineMessage } from 'react-intl';
import {
  formatHealthFactorValues,
  useAnalyticsReady,
  useArbPoints,
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
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { useNavigate } from 'react-router-dom';
import { ExpandedState } from '@tanstack/react-table';
import {
  PointsLinks,
  getArbBoosts,
  Registry,
} from '@notional-finance/core-entities';
import { PointsIcon } from '@notional-finance/icons';

export function getVaultLeveragePercentage(
  v: VaultAccountRiskProfile,
  theme: Theme
) {
  const maxLeverageRatio = v.maxLeverageRatio;
  const leverageRatio = v.leverageRatio();
  const leveragePercentage = leverageRatio
    ? (leverageRatio * 100) / maxLeverageRatio
    : null;
  let trackColor: string | undefined;

  if (leveragePercentage) {
    trackColor =
      leveragePercentage > 90
        ? theme.palette.error.main
        : leveragePercentage > 70
        ? theme.palette.warning.main
        : undefined;
  }

  return { maxLeverageRatio, leverageRatio, leveragePercentage, trackColor };
}

export function getVaultReinvestmentDates(
  network: Network | undefined,
  vaultAddress: string,
  analyticsReady: boolean
) {
  const reinvestmentData =
    network && analyticsReady
      ? Registry.getAnalyticsRegistry().getVaultReinvestments(network)
      : undefined;
  let arbReinvestmentDate = '';
  let mainnetReinvestmentDate = '';

  const vaultReinvestmentData =
    vaultAddress && reinvestmentData?.[vaultAddress]
      ? reinvestmentData[vaultAddress]
      : undefined;
  if (vaultReinvestmentData && vaultReinvestmentData.length > 0) {
    arbReinvestmentDate = getDateString(
      vaultReinvestmentData[0].timestamp + SECONDS_IN_DAY
    );
    mainnetReinvestmentDate = getDateString(
      vaultReinvestmentData[0].timestamp + 7 * SECONDS_IN_DAY
    );
  }

  return { arbReinvestmentDate, mainnetReinvestmentDate };
}

export const useVaultHoldingsTable = () => {
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};
  const [toggleOption, setToggleOption] = useState<number>(0);
  const isBlocked = useLeverageBlock();
  const arbPoints = useArbPoints();
  const theme = useTheme();
  const { baseCurrency } = useAppState();
  const navigate = useNavigate();
  const network = useSelectedNetwork();
  const analyticsReady = useAnalyticsReady(network);
  const vaults = useVaultHoldings(network);

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

  const HealthFactorCell = ({ cell }) => {
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

  const vaultHoldingsColumns: DataTableColumn[] = useMemo(() => {
    return [
      {
        header: (
          <FormattedMessage
            defaultMessage="Vault"
            description={'vault header'}
          />
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
    ];
  }, []);

  const vaultHoldingsData = vaults.map(
    ({
      vault: v,
      denom,
      profit,
      totalAPY,
      amountPaid,
      strategyAPY,
      borrowAPY,
      vaultYield,
    }) => {
      const config = v.vaultConfig;
      const { leverageRatio, maxLeverageRatio } = getVaultLeveragePercentage(
        v,
        theme
      );
      const points = vaultYield?.pointMultiples;
      const boostNum = getArbBoosts(v.vaultShares.token, false);
      const pointsPerDay = v.netWorth().toFiat('USD').toFloat() * boostNum;
      const totalPoints =
        arbPoints?.find(({ token }) => token === v.vaultShares.tokenId)
          ?.points || 0;
      const { arbReinvestmentDate, mainnetReinvestmentDate } =
        getVaultReinvestmentDates(network, v.vaultAddress, analyticsReady);

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
                Max {maxLeverageRatio.toFixed(1)}
              </Body>
            </H4>
          ),
        },
      ];

      if (!points) {
        subRowData.push({
          label: (
            <FormattedMessage defaultMessage={'Time to Next Reinvestment'} />
          ),
          value:
            network === Network.mainnet
              ? mainnetReinvestmentDate
              : arbReinvestmentDate,
        });
      }

      if (points && network) {
        const pointsLink = PointsLinks[network][v.vaultAddress];
        subRowData.push({
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
                    `${pointsMultiple(points[k], leverageRatio).toFixed(
                      2
                    )}x ${k}`
                )
                .join(', ')}
            </LinkText>
          ),
        });
      } else if (totalPoints > 0) {
        subRowData.push({
          label: <FormattedMessage defaultMessage={'Points Earned'} />,
          value: (
            <H4 sx={{ display: 'flex' }}>
              <PointsIcon sx={{ marginRight: theme.spacing(0.5) }} />
              {formatNumberAsAbbr(totalPoints, 2, 'USD', { hideSymbol: true })}
              <Body
                sx={{
                  marginLeft: theme.spacing(0.5),
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                (
                {formatNumberAsAbbr(pointsPerDay, 2, 'USD', {
                  hideSymbol: true,
                })}
                )/day
              </Body>
            </H4>
          ),
        });
      }
      // TODO: ADD REAL REINVESTMENT DATA
      // else {
      //   subRowData.push({
      //     label: (
      //       <FormattedMessage defaultMessage={'TIME TO NEXT REINVESTMENT'} />
      //     ),
      //     value: '6 days 4 hrs',
      //   });
      // }

      const handleProfit = () => {
        const profitData = formatCryptoWithFiat(baseCurrency, profit) as any;
        if (points && profitData.data) {
          profitData.data[0].toolTipContent = defineMessage({
            defaultMessage:
              'Most of the APY in this strategy is driven by points and point earnings are not shown here. Check the partner protocol dashboard to track accrued points.',
            description: 'points tooltip',
          });
        }
        return profitData;
      };

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
        totalEarnings: handleProfit(),
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
          pointsWarning: points ? true : false,
          subRowData,
          buttonBarData: [
            {
              buttonText: <FormattedMessage defaultMessage={'Manage'} />,
              callback: () => {
                navigate(`/vaults/${network}/${v.vaultAddress}`);
              },
            },
            {
              buttonText: <FormattedMessage defaultMessage={'Withdraw'} />,
              callback: () => {
                navigate(`/vaults/${network}/${v.vaultAddress}/WithdrawVault`);
              },
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
    }
  );

  useEffect(() => {
    const formattedExpandedRows = vaultHoldingsColumns.reduce(
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
  }, [vaultHoldingsColumns, expandedRows, setExpandedRows]);

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
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    initialState,
    toggleBarProps: {
      toggleOption,
      setToggleOption,
      toggleData,
      showToggle: !isBlocked && vaults.length > 0,
    },
  };
};
