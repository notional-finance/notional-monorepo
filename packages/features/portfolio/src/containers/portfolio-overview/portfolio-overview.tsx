import { useState, useMemo, useEffect } from 'react';
import {
  MultiDisplayChart,
  BarChart,
  DataTable,
  TABLE_VARIANTS,
  ChevronCell,
  DataTableColumn,
  MultiValueCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { usePortfolioOverviewTable, useTotalsChart } from './hooks';
import {
  ClaimNoteButton,
  PortfolioPageHeader,
  ClaimableIncentives,
  TableActionRow,
  TotalEarningsTooltip,
} from '../../components';
import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import {
  useAppStore,
  useSelectedNetwork,
  usePendingPnLCalculation,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { ExpandedState } from '@tanstack/react-table';

const HealthFactorCell = ({ cell }) => {
  const theme = useTheme();
  const { column, getValue } = cell;
  const value = getValue();
  if (!value) return null;

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

const PortfolioOverview = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { barChartData, barConfig, totalsData } = useTotalsChart(baseCurrency);
  const [showGrouped, setShowGrouped] = useState(true);
  const network = useSelectedNetwork();
  const pendingTokenData = usePendingPnLCalculation(network);
  const { rows, hasLeverage } = usePortfolioOverviewTable(showGrouped);
  const [expandedRows, setExpandedRows] = useState<ExpandedState>({});
  const [currentTab, setCurrentTab] = useState(0);
  const initialState = expandedRows !== null ? { expanded: expandedRows } : {};

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
    ],
    [theme]
  );

  const tableTabs = [
    {
      title: <FormattedMessage defaultMessage="Positions" />,
    },
  ];

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

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.OVERVIEW}>
        <ClaimableIncentives />
        <ClaimNoteButton />
      </PortfolioPageHeader>
      <Container>
        {barChartData && barConfig && (
          <MultiDisplayChart
            chartComponents={[
              {
                chartHeaderTotalsData: totalsData,
                id: 'apy-area-chart',
                title: 'APY',
                hideTopGridLine: false,
                Component: (
                  <BarChart
                    barChartData={barChartData}
                    barConfig={barConfig}
                    xAxisTickFormat="date"
                    yAxisTickFormat="currency"
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
          tabsThatIncludeToggle={[0]}
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
          data={rows}
          columns={Columns}
          pendingTokenData={pendingTokenData}
          pendingMessage={
            <FormattedMessage
              defaultMessage={
                'Positions are being recalculated to reflect your last transaction'
              }
            />
          }
          CustomRowComponent={TableActionRow}
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
