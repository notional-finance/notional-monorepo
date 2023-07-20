import { HeaderGroup } from 'react-table';
import { DataTableColumn, TABLE_VARIANTS } from '../types';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { UpAndDownIcon } from '@notional-finance/icons';
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
              {...(tableVariant === TABLE_VARIANTS.SORTABLE
                ? column['getHeaderProps'](column['getSortByToggleProps']())
                : column['getHeaderProps']())}
            >
              <TableColumnHeading>
                {column['render']('Header')}
                {tableVariant === TABLE_VARIANTS.SORTABLE &&
                  column['render']('Header') && (
                    <UpAndDownIcon
                      sx={{
                        height: '14px',
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-55%)',
                      }}
                    />
                  )}
              </TableColumnHeading>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default DataTableHead;
