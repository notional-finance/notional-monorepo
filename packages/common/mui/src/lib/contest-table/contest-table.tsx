import { ReactNode } from 'react';
import { Table, TableContainer, Paper, useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { ContestTableTitleBar } from './contest-table-title-bar/contest-table-title-bar';
import { ContestTableHead } from './contest-table-head/contest-table-head';
import { ContestTableBody } from './contest-table-body/contest-table-body';
import { PageLoading } from '../page-loading/page-loading';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { FormattedMessage } from 'react-intl';
import { TableCell } from '../typography/typography';
import { colors } from '@notional-finance/styles';
import { CONTEST_TABLE_VARIANTS } from './types';

interface ContestTableProps {
  columns: Array<any>;
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
  hideOnMobile?: boolean;
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
  hideOnMobile = true,
  sx,
}: ContestTableProps) => {
  const theme = useTheme();
  const table = useReactTable({
    columns,
    data,
    initialState,
    getCoreRowModel: getCoreRowModel(),
  });
  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();

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
            <Table>
              {tableVariant === CONTEST_TABLE_VARIANTS.DEFAULT && (
                <ContestTableHead
                  headerGroups={headerGroups}
                  hideOnMobile={hideOnMobile}
                />
              )}
              <ContestTableBody rows={rows} isCurrentUser={isCurrentUser} />
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
                <Table>
                  <ContestTableHead
                    headerGroups={headerGroups}
                    hideOnMobile={hideOnMobile}
                  />
                </Table>
              </Box>
              <div style={{ maxHeight: maxHeight, overflow: 'auto' }}>
                <Table>
                  <ContestTableBody rows={rows} isCurrentUser={isCurrentUser} />
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
