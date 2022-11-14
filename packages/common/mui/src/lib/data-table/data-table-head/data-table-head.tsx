import { HeaderGroup } from 'react-table';
import { TABLE_VARIANTS } from '../data-table';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { DataTableColumn } from '../data-table';
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
                  ? theme.spacing(0.5, 3)
                  : tableVariant === TABLE_VARIANTS.MINI
                  ? theme.spacing(1)
                  : theme.spacing(2, 3),
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
