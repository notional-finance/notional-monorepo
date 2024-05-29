import { ReactNode, useRef, useState, SetStateAction, Dispatch } from 'react';
import { Table, TableContainer, Paper, useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { DataTableFilterBar } from './data-table-filter-bar/data-table-filter-bar';
import { DataTableTitleBar } from './data-table-title-bar/data-table-title-bar';
import { DataTableTabBar } from './data-table-tab-bar/data-table-tab-bar';
import { DataTableToggle } from './data-table-toggle/data-table-toggle';
import { DataTableHead } from './data-table-head/data-table-head';
import { DataTableBody } from './data-table-body/data-table-body';
import { DataTableScroll } from './data-table-scroll/data-table-scroll';
import { DataTablePending } from './data-table-pending/data-table-pending';
import {
  DataTableInfoBox,
  InfoBoxDataProps,
} from './data-table-info-box/data-table-info-box';

import { PageLoading } from '../page-loading/page-loading';
import {
  useReactTable,
  ExpandedState,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { FormattedMessage } from 'react-intl';
import { CSVLink } from 'react-csv';
import { TableCell } from '../typography/typography';
import { DownloadIcon } from '@notional-finance/icons';
import {
  TabBarPropsType,
  TableTitleButtonsType,
  ToggleBarPropsType,
  TABLE_VARIANTS,
} from './types';
import { colors } from '@notional-finance/styles';

export interface DataTableToggleProps {
  toggleOptions: JSX.Element[];
  toggleKey: number;
  setToggleKey: (v: number) => void;
}

interface DataTableProps {
  columns: Array<any>;
  data: Array<any>;
  pendingTokenData?: { hash: string; link: string }[];
  pendingMessage?: ReactNode;
  CustomRowComponent?: ({ row }: { row: any }) => JSX.Element;
  CustomTabComponent?: React.FunctionComponent;
  TabComponentVisible?: boolean;
  tabBarProps?: TabBarPropsType;
  toggleBarProps?: ToggleBarPropsType;
  tableTitleButtons?: TableTitleButtonsType[];
  tableTitle?: JSX.Element;
  tableTitleSubText?: JSX.Element;
  tableVariant?: TABLE_VARIANTS;
  hideExcessRows?: boolean;
  initialState?: Record<any, any>;
  setExpandedRows?: Dispatch<SetStateAction<ExpandedState>>;
  setShowHiddenRows?: Dispatch<SetStateAction<boolean>>;
  showHiddenRows?: boolean;
  tableLoading?: boolean;
  filterBarData?: any[];
  networkToggleData?: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  rightToggleData?: DataTableToggleProps;
  allNetworksToggleData?: DataTableToggleProps;
  csvDataFormatter?: (data: any[]) => any;
  accentCSV?: boolean;
  expandableTable?: boolean;
  stateZeroMessage?: ReactNode;
  hiddenRowMessage?: ReactNode;
  infoBoxData?: InfoBoxDataProps[];
  sx?: SxProps;
  maxHeight?: any;
}

export const DataTable = ({
  columns,
  data,
  pendingTokenData,
  pendingMessage,
  CustomRowComponent,
  CustomTabComponent,
  TabComponentVisible,
  tabBarProps,
  toggleBarProps,
  tableTitle,
  tableTitleSubText,
  tableVariant,
  hideExcessRows,
  tableTitleButtons,
  initialState,
  setExpandedRows,
  tableLoading,
  filterBarData,
  networkToggleData,
  rightToggleData,
  allNetworksToggleData,
  csvDataFormatter,
  accentCSV,
  stateZeroMessage,
  setShowHiddenRows,
  hiddenRowMessage,
  showHiddenRows,
  expandableTable,
  infoBoxData,
  maxHeight,
  sx,
}: DataTableProps) => {
  const theme = useTheme();
  const [viewAllRows, setViewAllRows] = useState<boolean>(!hideExcessRows);
  const table = useReactTable({
    columns,
    data,
    initialState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });
  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();
  const ref = useRef<HTMLDivElement | any>();
  const [infoBoxActive, setInfoBoxActive] = useState<boolean | undefined>(
    undefined
  );
  const filteredRows = rows.filter((data, index) => index < 4);
  const displayedRows = viewAllRows ? rows : filteredRows;
  const viewAllText = viewAllRows ? (
    <FormattedMessage defaultMessage={'Hide transactions'} />
  ) : (
    <FormattedMessage defaultMessage={'View all transactions'} />
  );

  const tableReady = !tableLoading && columns?.length > 0 && data?.length > 0;

  /**
    "Default Data Table": 
      - If you pass only the required props a plain table with no title bar will be rendered.
    
    NOTE* on maxHeight prop:
    - when using the max height prop be aware that you may need to pass additional width and marginRight styling props to align the table correctly.
    - An example of this can be found in useFCashPriceExposureTable

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

  const height = ref.current?.clientHeight;
  const width = ref.current?.clientWidth;

  return (
    <div
      style={{
        border: maxHeight ? theme.shape.borderStandard : '',
        borderRadius: maxHeight ? theme.shape.borderRadius() : '',
        zIndex: maxHeight ? 2 : 1,
        marginTop: maxHeight ? theme.spacing(5) : '',
      }}
    >
      {csvDataFormatter && data && (
        <CSVLink
          data={csvDataFormatter(data)}
          filename={'notional-market-data.csv'}
          target="_blank"
        >
          <Box
            sx={{
              display: width < 700 ? 'none' : 'block',
              color: accentCSV
                ? colors.neonTurquoise
                : theme.palette.typography.accent,
              textAlign: 'right',
              textDecoration: 'underline',
              marginBottom: theme.spacing(1),
            }}
          >
            <FormattedMessage defaultMessage={'Download CSV'} />
            <DownloadIcon
              sx={{
                fill: accentCSV
                  ? colors.neonTurquoise
                  : theme.palette.typography.accent,
                height: theme.spacing(2),
                marginLeft: theme.spacing(1),
              }}
            />
          </Box>
        </CSVLink>
      )}
      {maxHeight ? (
        <DataTableScroll
          columns={columns}
          data={data}
          tableVariant={tableVariant}
          networkToggleData={networkToggleData}
          filterBarData={filterBarData}
          tableTitle={tableTitle}
          maxHeight={maxHeight}
          tableReady={tableReady}
          tableLoading={tableLoading}
          sx={sx}
        />
      ) : (
        <TableContainer
          ref={ref}
          id="data-table-container"
          sx={
            {
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
                  tableVariant === TABLE_VARIANTS.MINI
                    ? theme.spacing(2)
                    : '1px',
                ...sx,
              },
            } as SxProps
          }
          component={Paper}
        >
          {tableTitle && !toggleBarProps && !tabBarProps && (
            <DataTableTitleBar
              tableTitle={tableTitle}
              tableTitleSubText={tableTitleSubText}
              setInfoBoxActive={setInfoBoxActive}
              infoBoxActive={infoBoxActive}
              tableTitleButtons={tableTitleButtons}
              tableVariant={tableVariant}
              expandableTable={expandableTable}
              showInfoIcon={infoBoxData && infoBoxData.length > 0}
            />
          )}
          {filterBarData && filterBarData.length > 0 && (
            <DataTableFilterBar
              filterBarData={filterBarData}
              rightToggleData={rightToggleData}
              allNetworksToggleData={allNetworksToggleData}
            />
          )}

          {tabBarProps && (
            <DataTableTabBar
              tabBarProps={tabBarProps}
              toggleBarProps={toggleBarProps}
            />
          )}

          {toggleBarProps && tableTitle && !tabBarProps && (
            <DataTableToggle
              toggleBarProps={toggleBarProps}
              expandableTable={expandableTable}
              tableTitle={tableTitle}
            />
          )}

          {TabComponentVisible && CustomTabComponent && <CustomTabComponent />}
          {pendingTokenData && pendingTokenData?.length > 0 && (
            <DataTablePending
              pendingTxns={pendingTokenData}
              pendingMessage={pendingMessage}
            />
          )}
          {tableReady ? (
            <>
              <div style={{ overflow: filterBarData ? 'auto' : '' }}>
                <Table>
                  <DataTableHead
                    headerGroups={headerGroups}
                    tableVariant={tableVariant}
                    expandableTable={expandableTable}
                  />
                  <DataTableBody
                    rows={displayedRows}
                    tableVariant={tableVariant}
                    CustomRowComponent={CustomRowComponent}
                    setExpandedRows={setExpandedRows}
                    initialState={initialState}
                    expandableTable={expandableTable}
                  />
                </Table>
              </div>
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
              {infoBoxActive && infoBoxData && (
                <DataTableInfoBox
                  infoBoxData={infoBoxData}
                  height={height}
                  width={width}
                  setInfoBoxActive={setInfoBoxActive}
                  infoBoxActive={infoBoxActive}
                />
              )}
            </>
          ) : (
            <Box sx={{ display: TabComponentVisible ? 'none' : '' }}>
              {tableLoading ? (
                <PageLoading type="notional" />
              ) : (
                <TableCell
                  sx={{
                    textAlign: 'center',
                    margin: theme.spacing(4, 0),
                    color: theme.palette.typography.main,
                  }}
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
          {setShowHiddenRows && hiddenRowMessage && (
            <TableCell
              sx={{
                textAlign: 'center',
                background: theme.palette.background.paper,
                color: theme.palette.primary.light,
                textDecoration: 'underline',
                cursor: 'pointer',
                marginRight: `-${theme.spacing(2)}`,
                marginLeft: `-${theme.spacing(2)}`,
                marginTop: theme.spacing(2),
                marginBottom: `-${theme.spacing(2)}`,
                padding: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowHiddenRows(!showHiddenRows)}
            >
              <span>{hiddenRowMessage}</span>
              <ArrowIcon
                sx={{
                  color: theme.palette.primary.light,
                  transform: `rotate(${showHiddenRows ? '0' : '180'}deg)`,
                  transition: 'transform .5s ease-in-out',
                  height: theme.spacing(2),
                }}
              />
            </TableCell>
          )}
        </TableContainer>
      )}
    </div>
  );
};

export default DataTable;
