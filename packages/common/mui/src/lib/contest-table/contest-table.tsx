import { ReactNode } from 'react';
import { Table, TableContainer, Paper, useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
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
  isCurrentUser?: boolean;
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
  isCurrentUser = false,
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
  const tableReady = !tableLoading && columns?.length && data?.length;
  tableVariant = tableVariant || CONTEST_TABLE_VARIANTS.DEFAULT;
  return (
    <TableContainer
      id="data-table-container"
      sx={
        {
          '&.MuiPaper-root': {
            width:
              tableVariant === CONTEST_TABLE_VARIANTS.COMPACT
                ? '363px'
                : '100%',
            boxShadow: 'none',
            overflow: !tableReady ? 'hidden' : 'auto',
            overflowX: 'hidden',
            backgroundColor: 'transparent',
            padding: '1px',
            ...sx,
          },
        } as SxProps
      }
      component={Paper}
    >
      {tableTitle && (
        <ContestTableTitleBar
          tableVariant={tableVariant}
          tableTitle={tableTitle}
          tableTitleSubText={tableTitleSubText}
        />
      )}
      {tableReady ? (
        <>
          {!maxHeight && (
            <Table {...getTableProps()}>
              {tableVariant === CONTEST_TABLE_VARIANTS.DEFAULT && (
                <ContestTableHead headerGroups={headerGroups} hideOnMobile />
              )}
              <ContestTableBody
                rows={rows}
                prepareRow={prepareRow}
                isCurrentUser={isCurrentUser}
              />
            </Table>
          )}
          {maxHeight && (
            <>
              <Box
                component={'div'}
                sx={{
                  position: 'sticky',
                  top: 0,
                }}
              >
                <Table {...getTableProps()}>
                  <ContestTableHead headerGroups={headerGroups} hideOnMobile />
                </Table>
              </Box>
              <div style={{ maxHeight: maxHeight, overflow: 'auto' }}>
                <Table {...getTableProps()}>
                  {/* <ContestTableHead headerGroups={headerGroups} /> */}
                  <ContestTableBody
                    rows={rows}
                    prepareRow={prepareRow}
                    isCurrentUser={isCurrentUser}
                  />
                </Table>
              </div>
            </>
          )}
        </>
      ) : (
        <Box>
          {tableLoading ? (
            <PageLoading type="notional" />
          ) : (
            <TableCell
              sx={{
                textAlign: 'center',
                margin: theme.spacing(4, 0),
                color: colors.white,
              }}
            >
              {stateZeroMessage ? (
                stateZeroMessage
              ) : (
                <FormattedMessage defaultMessage={'No entrants'} />
              )}
            </TableCell>
          )}
        </Box>
      )}
    </TableContainer>
  );
};

export default ContestTable;
