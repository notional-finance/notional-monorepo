import { useTheme, Box } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { DataTableHead } from '../data-table-head/data-table-head';
import { DataTableBody } from '../data-table-body/data-table-body';
import { DataTableColumn, TABLE_VARIANTS } from '../types';
import { PageLoading } from '../../page-loading/page-loading';
import { FormattedMessage } from 'react-intl';
import { TableCell } from '../../typography/typography';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRef } from 'react';
import DataTableFilterBar from '../data-table-filter-bar/data-table-filter-bar';

interface DataTableProps {
  columns: ColumnDef<DataTableColumn>[];
  data: Array<any>;
  tableVariant?: TABLE_VARIANTS;
  initialState?: Record<any, any>;
  filterBarData?: any[];
  networkToggleData?: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
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
  networkToggleData,
  filterBarData,
  sx,
}: DataTableProps) => {
  const theme = useTheme();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();

  //The virtualizer needs to know the scrollable container element
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 61, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <Box>
      <Box
        sx={{
          background: theme.palette.background.paper,
          borderRadius: '6px 6px 0px 0px',
          width: '100%',
        }}
      >
        {filterBarData && filterBarData.length > 0 && networkToggleData && (
          <DataTableFilterBar
            filterBarData={filterBarData}
            networkToggleData={networkToggleData}
          />
        )}
      </Box>
      <Box
        component="div"
        ref={tableContainerRef}
        sx={{
          overflow: 'auto',
          position: 'relative',
          maxHeight: maxHeight,
          height: '100%',
          '.table': {
            display: 'grid',
            borderRadius: networkToggleData
              ? '0px'
              : theme.shape.borderRadius(),
            background: theme.palette.background.paper,
            '.header': {
              background: theme.palette.background.paper,
              display: 'grid',
              position: 'sticky',
              top: 0,
              zIndex: 2,
              marginRight: '0px',
              borderRadius: theme.shape.borderRadius(),
            },
          },
          ...sx,
        }}
      >
        <Box className="table">
          <DataTableHead
            tableTitle={tableTitle}
            headerGroups={headerGroups}
            tableVariant={tableVariant}
            expandableTable={false}
          />
          {tableReady ? (
            <DataTableBody
              rows={rows}
              rowVirtualizer={rowVirtualizer}
              tableVariant={tableVariant}
              initialState={initialState}
            />
          ) : (
            <Box>
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
    </Box>
  );
};

export default DataTableScroll;
