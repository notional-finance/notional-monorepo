import { ReactNode } from 'react';
import { useState, SetStateAction, Dispatch } from 'react';
import { Table, TableContainer, Paper, useTheme, Box } from '@mui/material';
import { DataTableFilterBar } from './data-table-filter-bar/data-table-filter-bar';
import { DataTableTitleBar } from './data-table-title-bar/data-table-title-bar';
import { DataTableTabBar } from './data-table-tab-bar/data-table-tab-bar';
import { DataTableHead } from './data-table-head/data-table-head';
import { DataTableBody } from './data-table-body/data-table-body';
import { PageLoading } from '../page-loading/page-loading';
import { useTable, useExpanded, useSortBy } from 'react-table';
import { FormattedMessage } from 'react-intl';
import { TableCell } from '../typography/typography';
import {
  DataTableColumn,
  ExpandedRows,
  TabBarPropsType,
  TableTitleButtonsType,
  TABLE_VARIANTS,
} from './types';

interface DataTableProps {
  columns: Array<DataTableColumn>;
  data: Array<any>;
  CustomRowComponent?: ({ row }: { row: any }) => JSX.Element;
  CustomTabComponent?: React.FunctionComponent;
  TabComponentVisible?: boolean;
  tabBarProps?: TabBarPropsType;
  tableTitleButtons?: TableTitleButtonsType[];
  tableTitle?: JSX.Element;
  tableVariant?: TABLE_VARIANTS;
  hideExcessRows?: boolean;
  initialState?: Record<any, any>;
  setExpandedRows?: Dispatch<SetStateAction<ExpandedRows | null>>;
  tableLoading?: boolean;
  filterBarData?: any[];
  clearQueryAndFilters?: () => void;
  marketDataCSVFormatter?: (data: any[]) => any;
  stateZeroMessage?: ReactNode;
}

export const DataTable = ({
  columns,
  data,
  CustomRowComponent,
  CustomTabComponent,
  TabComponentVisible,
  tabBarProps,
  tableTitle,
  tableVariant,
  hideExcessRows,
  tableTitleButtons,
  initialState,
  setExpandedRows,
  tableLoading,
  filterBarData,
  clearQueryAndFilters,
  marketDataCSVFormatter,
  stateZeroMessage,
}: DataTableProps) => {
  const theme = useTheme();
  const [viewAllRows, setViewAllRows] = useState<boolean>(!hideExcessRows);
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: initialState,
    },
    useSortBy,
    useExpanded
  );

  const filteredRows = rows.filter((data, index) => index < 4);
  const displayedRows = viewAllRows ? rows : filteredRows;
  const viewAllText = viewAllRows ? (
    <FormattedMessage defaultMessage={'Hide transactions'} />
  ) : (
    <FormattedMessage defaultMessage={'View all transactions'} />
  );

  const tableReady = !tableLoading && columns?.length && data?.length;
  const expandableTable = CustomRowComponent ? true : false;

  /**
    "Default Data Table": 
      - If you pass only the required props a plain table with no title bar will be rendered.

    DATA TABLE VARIANTS =======

    DEFAULT: 
      - Standard styling applies

    MINI: 
      - Used to display our smallest table. Used in side drawers primarily.
    
    TOTAL_ROW: 
      - Adds a styled total row option
    
    SORTABLE: 
      - Adds the ability for the columns to be sorted. Add ads a up and down arrow to the colum headers
    
    DATA TABLE HEADER/TITLE BAR TYPES =======

    DataTableTitleBar: 
      - Requires a tableTitle string. Optionally the tableTitleButtons prop can be passed to render a button bank.

    DataTableTabBar: 
      - Requires the tabBarProps object and data/columns passed for each differing table. This will render a tabbed table.
      - If the TabComponentVisible and CustomTabComponent props are included any react component can be rendered as the table body.

    DataTableFilterBar: 
      - Requires filterBarData to function. The filterBarData will automatically populate one or more filter dropdowns depending on need. 
  */

  return (
    <TableContainer
      id="data-table-container"
      sx={{
        overflow: 'scroll',
        '&.MuiPaper-root': {
          width: '100%',
          boxShadow: 'none',
          border: theme.shape.borderStandard,
          borderRadius: theme.shape.borderRadius(),
          overflow: !tableReady
            ? 'hidden'
            : filterBarData && filterBarData.length > 0
            ? 'visible'
            : 'auto',
          backgroundColor:
            tableVariant === TABLE_VARIANTS.MINI
              ? theme.palette.background.default
              : theme.palette.background.paper,
          padding:
            tableVariant === TABLE_VARIANTS.MINI ? theme.spacing(2) : '1px',
        },
      }}
      component={Paper}
    >
      {tableTitle && (
        <DataTableTitleBar
          tableTitle={tableTitle}
          tableTitleButtons={tableTitleButtons}
          tableVariant={tableVariant}
          expandableTable={expandableTable}
        />
      )}

      {filterBarData && filterBarData.length > 0 && (
        <DataTableFilterBar
          filterBarData={filterBarData}
          tableData={data}
          clearQueryAndFilters={clearQueryAndFilters}
          downloadCSVFormatter={marketDataCSVFormatter}
        />
      )}

      {tabBarProps && <DataTableTabBar tabBarProps={tabBarProps} />}

      {TabComponentVisible && CustomTabComponent && <CustomTabComponent />}

      {tableReady ? (
        <>
          <Table {...getTableProps()}>
            <DataTableHead
              headerGroups={headerGroups}
              tableVariant={tableVariant}
              expandableTable={expandableTable}
            />
            <DataTableBody
              rows={displayedRows}
              prepareRow={prepareRow}
              tableVariant={tableVariant}
              CustomRowComponent={CustomRowComponent}
              setExpandedRows={setExpandedRows}
              initialState={initialState}
            />
          </Table>
          {rows.length > 4 && hideExcessRows && (
            <Box
              sx={{
                color: theme.palette.primary.main,
                padding: '10px',
                fontSize: '0.875rem',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setViewAllRows(!viewAllRows)}
            >
              {viewAllText}
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: TabComponentVisible ? 'none' : '' }}>
          {tableLoading ? (
            <PageLoading type="notional" />
          ) : (
            <TableCell
              sx={{ textAlign: 'center', margin: theme.spacing(4, 0) }}
            >
              {stateZeroMessage ? (
                stateZeroMessage
              ) : (
                <FormattedMessage defaultMessage={'No Data Available'} />
              )}
            </TableCell>
          )}
        </Box>
      )}
    </TableContainer>
  );
};

export default DataTable;
