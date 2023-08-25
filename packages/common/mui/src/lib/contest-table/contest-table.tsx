import { ReactNode } from 'react';
import { Table, TableContainer, Paper, useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
// import { ArrowIcon } from '@notional-finance/icons';
import { ContestTableTitleBar } from './contest-table-title-bar/contest-table-title-bar';
import { ContestTableHead } from './contest-table-head/contest-table-head';
import { ContestTableBody } from './contest-table-body/contest-table-body';
import { PageLoading } from '../page-loading/page-loading';
import { useTable, useExpanded, useSortBy } from 'react-table';
import { FormattedMessage } from 'react-intl';
import { TableCell } from '../typography/typography';
import { colors } from '@notional-finance/styles';
import { ContestTableColumn, CONTEST_TABLE_VARIANTS } from './types';

interface ContestTableProps {
  columns: Array<ContestTableColumn>;
  data: Array<any>;
  tableTitle?: JSX.Element;
  tableTitleSubText?: JSX.Element;
  tableVariant?: CONTEST_TABLE_VARIANTS;
  initialState?: Record<any, any>;
  tableLoading?: boolean;
  stateZeroMessage?: ReactNode;
  sx?: SxProps;
  maxHeight?: any;
}

export const ContestTable = ({
  columns,
  data,
  tableTitle,
  tableTitleSubText,
  initialState,
  tableLoading,
  stateZeroMessage,
  tableVariant,
  maxHeight,
  sx,
}: ContestTableProps) => {
  const theme = useTheme();
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: initialState,
    },
    useSortBy,
    useExpanded
  );
  // const ref = useRef<HTMLDivElement | any>();
  const tableReady = !tableLoading && columns?.length && data?.length;

  // const height = ref.current?.clientHeight;
  // const width = ref.current?.clientWidth;

  return (
    <TableContainer
      // ref={ref}
      id="data-table-container"
      sx={
        {
          overflow: 'scroll',
          '&.MuiPaper-root': {
            width:
              tableVariant === CONTEST_TABLE_VARIANTS.COMPACT
                ? '380px'
                : '100%',
            boxShadow: 'none',
            border: `1px solid ${colors.neonTurquoise}`,
            overflow: !tableReady ? 'hidden' : 'auto',
            backgroundColor: '#041D2E',
            padding: '1px',
            ...sx,
          },
        } as SxProps
      }
      component={Paper}
    >
      {tableTitle && (
        <ContestTableTitleBar
          tableTitle={tableTitle}
          tableTitleSubText={tableTitleSubText}
        />
      )}
      {tableReady ? (
        <>
          {!maxHeight && (
            <Table {...getTableProps()}>
              {tableVariant === CONTEST_TABLE_VARIANTS.DEFAULT && (
                <ContestTableHead headerGroups={headerGroups} />
              )}
              <ContestTableBody rows={rows} prepareRow={prepareRow} />
            </Table>
          )}
          {/* {maxHeight && (
            <>
              <div style={{ position: 'sticky', top: 0 }}>
                <Table {...getTableProps()}>
                  <ContestTableHead
                    headerGroups={headerGroups}
                    tableVariant={tableVariant}
                    expandableTable={expandableTable}
                  />
                </Table>
              </div>
              <div style={{ maxHeight: maxHeight, overflow: 'auto' }}>
                <Table {...getTableProps()}>
                  <ContestTableBody
                    rows={displayedRows}
                    prepareRow={prepareRow}
                    tableVariant={tableVariant}
                    CustomRowComponent={CustomRowComponent}
                    setExpandedRows={setExpandedRows}
                    initialState={initialState}
                  />
                </Table>
              </div>
            </>
          )} */}
        </>
      ) : (
        <Box>
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

export default ContestTable;
