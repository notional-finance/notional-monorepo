import { HeaderGroup } from 'react-table';
import { DataTableColumn, TABLE_VARIANTS } from '../types';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { TableColumnHeading } from '../../typography/typography';

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
        borderBottom:
          tableVariant === TABLE_VARIANTS.TOTAL_ROW
            ? theme.shape.borderStandard
            : '',
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
                padding: expandableTable
                  ? theme.spacing(0.5, 2)
                  : tableVariant === TABLE_VARIANTS.MINI
                  ? theme.spacing(1)
                  : theme.spacing(2),
                textAlign: column['textAlign'] || 'center',
                borderBottom: expandableTable
                  ? theme.shape.borderStandard
                  : 'none',
                whiteSpace: 'nowrap',
              }}
              {...column['getHeaderProps']()}
            >
              <TableColumnHeading>
                {column['render']('Header')}
              </TableColumnHeading>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default DataTableHead;
