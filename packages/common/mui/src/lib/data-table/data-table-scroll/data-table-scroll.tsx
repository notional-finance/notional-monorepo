import { useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { DataTableHead } from '../data-table-head/data-table-head';
import { DataTableBody } from '../data-table-body/data-table-body';
import { useTable, useBlockLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { DataTableColumn, TABLE_VARIANTS } from '../types';
import { PageLoading } from '../../page-loading/page-loading';
import { FormattedMessage } from 'react-intl';
import { TableCell } from '../../typography/typography';

interface DataTableProps {
  columns: Array<DataTableColumn>;
  data: Array<any>;
  tableVariant?: TABLE_VARIANTS;
  initialState?: Record<any, any>;
  tableTitle?: JSX.Element;
  tableLoading?: boolean;
  tableReady?: boolean;
  sx?: SxProps;
  maxHeight: string;
}

export const DataTableScroll = ({
  columns,
  data,
  tableVariant,
  tableTitle,
  initialState,
  maxHeight,
  tableLoading,
  tableReady,
  sx,
}: DataTableProps) => {
  const theme = useTheme();
  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      initialState: initialState,
    },
    useSticky,
    useBlockLayout
  );
  const displayedRows = rows;

  return (
    <Box
      component="div"
      sx={{
        '.table': {
          border: theme.shape.borderStandard,
          borderRadius: theme.shape.borderRadius(),
          background: theme.palette.background.paper,
          '.header': {
            background: theme.palette.background.paper,
          },

          '.th, .td': {
            overflow: 'hidden',

            '.resizer': {
              display: 'inline-block',
              width: '5px',
              height: '100%',
              position: 'absolute',
              right: 0,
              top: 0,
              transform: 'translateX(50%)',
              zIndex: 1,
            },
          },
          '&.sticky': {
            overflowY: 'scroll',
            overflowX: 'auto',
            '.header, .title-bar': {
              top: 0,
              position: 'sticky',
              zIndex: 1,
              width: 'fit-content',
            },
            '.body': {
              position: 'relative',
              zIndex: 0,
            },
            '[data-sticky-td]': {
              position: 'sticky',
            },
          },
        },
        ...sx,
      }}
    >
      <Box
        {...getTableProps()}
        className="table sticky"
        sx={{ width: '100%', maxHeight: maxHeight }}
      >
        <DataTableHead
          tableTitle={tableTitle}
          headerGroups={headerGroups}
          tableVariant={tableVariant}
          expandableTable={false}
        />
        {tableReady ? (
          <DataTableBody
            rows={displayedRows}
            prepareRow={prepareRow}
            tableVariant={tableVariant}
            initialState={initialState}
          />
        ) : (
          <Box sx={{ height: maxHeight }}>
            {tableLoading ? (
              <PageLoading type="notional" />
            ) : (
              <TableCell
                sx={{ textAlign: 'center', margin: theme.spacing(4, 0) }}
              >
                <FormattedMessage defaultMessage={'No Data Available'} />
              </TableCell>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataTableScroll;
