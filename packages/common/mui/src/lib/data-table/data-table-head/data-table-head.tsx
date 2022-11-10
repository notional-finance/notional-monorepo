import { HeaderGroup } from 'react-table';
import { TABLE_VARIANTS } from '../data-table';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { DataTableColumn } from '../data-table';

interface DataTableHeadProps {
  headerGroups: Array<HeaderGroup>;
  expandableTable: boolean;
  tableVariant?: TABLE_VARIANTS;
}

export const DataTableHead = ({
  headerGroups,
  expandableTable,
  tableVariant,
}: DataTableHeadProps) => {
  const theme = useTheme();

  return (
    <TableHead
      sx={{
        position: 'relative',
        boxShadow: expandableTable ? theme.shape.shadowStandard : '',
      }}
    >
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <TableRow {...headerGroup['getHeaderGroupProps']()}>
          {headerGroup.headers.map((column: DataTableColumn) => (
            <TableCell
              sx={{
                color: expandableTable
                  ? theme.palette.background.accentDefault
                  : theme.palette.borders.accentPaper,
                fontWeight: '600',
                fontSize: '12px',
                padding: expandableTable
                  ? '5px 24px'
                  : tableVariant === TABLE_VARIANTS.MINI
                  ? '16px'
                  : '16px 24px',
                letterSpacing: '1px',
                textAlign: column['textAlign'] || 'center',
                textTransform: 'uppercase',
                borderBottom: expandableTable ? theme.shape.borderStandard : 'none',
                whiteSpace: 'nowrap',
              }}
              {...column['getHeaderProps']()}
            >
              {column['render']('Header')}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default DataTableHead;
