import { useState, useEffect } from 'react';
import {
  MultiDisplayChart,
  DataTable,
  TABLE_VARIANTS,
  ChevronCell,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { usePortfolioOverviewTable, useTotalsChart } from './hooks';
import {
  PortfolioPageHeader,
  ClaimableIncentives,
  TableActionRow,
  TotalEarningsTooltip,
} from '../../components';
import { Box, styled, useTheme } from '@mui/material';
import {
  getDateString,
  PORTFOLIO_CATEGORIES,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import {
  useAppStore,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { ExpandedState } from '@tanstack/react-table';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import { useEarningsBreakdown } from './hooks/use-earnings-breakdown';

const HealthFactorCell = ({ cell }) => {
  const { getValue } = cell;
  const value = getValue();
  if (!value) return null;

  return (
    <Box
      sx={{
        color: value.textColor,
        display: 'flex',
        justifyContent: 'flex-end',
        fontSize: '16px',
      }}
    >
      {value.value}
    </Box>
  );
};

enum TableTab {
  OVERVIEW = 0,
  EARNINGS_BREAKDOWN = 1,
}

const useTableTabState = () => {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [currentTab, setCurrentTab] = useState<TableTab>(TableTab.OVERVIEW);

  const overviewColumns = [
    {
      header: <FormattedMessage defaultMessage="Asset" />,
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(37.5),
    },
    {
      header: <FormattedMessage defaultMessage="Health Factor" />,
      cell: HealthFactorCell,
      accessorKey: 'healthFactor',
      textAlign: 'right',
      expandableTable: true,
    },
    {
      header: <FormattedMessage defaultMessage="Market APY" />,
      cell: MultiValueCell,
      accessorKey: 'marketApy',
      fontWeightBold: true,
      textAlign: 'right',
      expandableTable: true,
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
      accessorKey: 'totalEarnings',
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
  ];

  const earningsBreakdownColumns = [
    {
      header: <FormattedMessage defaultMessage="Asset" />,
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(37.5),
    },
    {
      header: <FormattedMessage defaultMessage="Incentives Earnings" />,
      cell: MultiValueCell,
      // ToolTip: TotalEarningsTooltip,
      accessorKey: 'incentivesEarnings',
      fontWeightBold: true,
      textAlign: 'right',
      expandableTable: true,
      showLoadingSpinner: true,
      showGreenText: true,
    },
    {
      header: <FormattedMessage defaultMessage="Accrued Interest" />,
      cell: MultiValueCell,
      // ToolTip: TotalEarningsTooltip,
      fontWeightBold: true,
      accessorKey: 'accruedInterest',
      textAlign: 'right',
      expandableTable: true,
      showLoadingSpinner: true,
      showGreenText: true,
    },
    {
      header: <FormattedMessage defaultMessage="Market PNL" />,
      cell: MultiValueCell,
      accessorKey: 'marketPNL',
      textAlign: 'right',
      fontWeightBold: true,
      expandableTable: true,
      showGreenText: true,
    },
    {
      header: <FormattedMessage defaultMessage="Fees Paid" />,
      cell: MultiValueCell,
      accessorKey: 'feesPaid',
      textAlign: 'right',
      expandableTable: true,
      fontWeightBold: true,
    },
    {
      header: <FormattedMessage defaultMessage="Total Earnings" />,
      cell: MultiValueCell,
      accessorKey: 'totalEarnings',
      textAlign: 'right',
      fontWeightBold: true,
      expandableTable: true,
      showLoadingSpinner: true,
      showGreenText: true,
    },
  ];

  const Columns =
    currentTab === TableTab.OVERVIEW
      ? overviewColumns
      : earningsBreakdownColumns;

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

  const initialState =
    expandedRows !== null
      ? {
          expanded: expandedRows,
          clickDisabled: currentTab === TableTab.EARNINGS_BREAKDOWN,
        }
      : {
          clickDisabled: currentTab === TableTab.EARNINGS_BREAKDOWN,
        };

  return { Columns, initialState, setCurrentTab, currentTab, setExpandedRows };
};

const PortfolioOverview = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const [slot, setSlot] = useState<'all' | '1y' | '3m' | '1m'>('all');

  const { barChartData, barConfig, totalsData } = useTotalsChart(
    baseCurrency,
    SECONDS_IN_DAY * 2,
    slot === '1m'
      ? SECONDS_IN_DAY * 2 * 15
      : slot === '3m'
      ? SECONDS_IN_DAY * 2 * 15 * 3
      : slot === '1y'
      ? SECONDS_IN_DAY * 365
      : undefined
  );
  const [showGrouped, setShowGrouped] = useState(true);
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const { rows, hasLeverage } = usePortfolioOverviewTable(showGrouped);
  const earningsBreakdownData = useEarningsBreakdown(showGrouped);
  const { Columns, initialState, setCurrentTab, currentTab, setExpandedRows } =
    useTableTabState();

  const tableTabs = [
    {
      title: <FormattedMessage defaultMessage="Positions" />,
    },
    {
      title: <FormattedMessage defaultMessage="Earnings Breakdown" />,
    },
  ];

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.OVERVIEW}>
        <ClaimableIncentives />
      </PortfolioPageHeader>
      <Container>
        {barChartData && barConfig && (
          <MultiDisplayChart
            chartComponents={[
              {
                chartHeaderTotalsData: totalsData,
                headerButtons: {
                  buttons: [
                    {
                      label: 'All',
                      value: 'all',
                      onClick: () => setSlot('all'),
                    },
                    {
                      label: '1Y',
                      value: '1y',
                      onClick: () => setSlot('1y'),
                    },
                    {
                      label: '3M',
                      value: '3m',
                      onClick: () => setSlot('3m'),
                    },
                    {
                      label: '1M',
                      value: '1m',
                      onClick: () => setSlot('1m'),
                    },
                  ],
                },
                id: 'apy-area-chart',
                title: 'APY',
                hideTopGridLine: false,
                Component: (
                  <LineChart
                    data={barChartData.map(
                      ({
                        timestamp,
                        totalNetWorth,
                        totalAssets,
                        totalDebts,
                      }) => ({
                        date: timestamp,
                        totalNetWorth,
                        totalAssets,
                        totalDebts,
                      })
                    )}
                    lineConfig={barConfig}
                    areaKey="totalNetWorth"
                    XAxisKey="date"
                    showYAxis={true}
                    tickFormatter={(value) => {
                      return getDateString(value, { hideYear: true });
                    }}
                  />
                ),
              },
            ]}
          />
        )}
      </Container>
      <Box sx={{ '#data-table-container': { marginBottom: theme.spacing(4) } }}>
        <DataTable
          tabBarProps={{
            tableTabs,
            setCurrentTab,
            currentTab,
          }}
          tabsThatIncludeToggle={[
            TableTab.OVERVIEW,
            TableTab.EARNINGS_BREAKDOWN,
          ]}
          toggleBarProps={{
            toggleOption: showGrouped ? 0 : 1,
            setToggleOption: (option) => setShowGrouped(option === 0),
            toggleData: [
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
            ],
            showToggle: hasLeverage,
          }}
          data={currentTab === TableTab.OVERVIEW ? rows : earningsBreakdownData}
          columns={Columns}
          pendingTokenData={pendingTokenData}
          pendingMessage={
            <FormattedMessage
              defaultMessage={
                'Positions are being recalculated to reflect your last transaction'
              }
            />
          }
          CustomRowComponent={
            currentTab === TableTab.OVERVIEW ? TableActionRow : undefined
          }
          expandableTable={true}
          setExpandedRows={setExpandedRows}
          tableVariant={TABLE_VARIANTS.TOTAL_ROW}
          initialState={initialState}
        />
      </Box>
    </Box>
  );
};

export const Container = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default observer(PortfolioOverview);
