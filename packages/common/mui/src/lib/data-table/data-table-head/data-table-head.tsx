import { HeaderGroup } from 'react-table';
import { DataTableColumn, TABLE_VARIANTS } from '../types';
import {
  TableCell,
  TableHead,
  TableRow,
  useTheme,
  styled,
} from '@mui/material';
import { UpAndDownIcon } from '@notional-finance/icons';
import { TableColumnHeading } from '../../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';

interface DataTableHeadProps {
  headerGroups: Array<HeaderGroup>;
  expandableTable: boolean;
  tableVariant?: TABLE_VARIANTS;
}
interface TableHeadContainerProps {
  expandableTable: boolean;
  tableVariant?: TABLE_VARIANTS;
  theme: NotionalTheme;
}

export const DataTableHead = ({
  headerGroups,
  expandableTable,
  tableVariant,
}: DataTableHeadProps) => {
  const theme = useTheme();
  return (
    <TableHeadContainer
      expandableTable={expandableTable}
      tableVariant={tableVariant}
      theme={theme}
    >
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <TableRow
          {...headerGroup['getHeaderGroupProps']()}
          sx={{
            height: expandableTable ? theme.spacing(4) : '',
          }}
        >
          {headerGroup.headers.map((column: DataTableColumn) => (
            <TableCell
              className={column.className}
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
                borderTop: expandableTable
                  ? theme.shape.borderStandard
                  : 'none',
                borderBottom: expandableTable
                  ? theme.shape.borderStandard
                  : 'none',
                whiteSpace: 'nowrap',
                'sticky-column': {
                  minWidth: column['width'],
                },
                width: column['width'] || 'auto',
              }}
              {...(tableVariant === TABLE_VARIANTS.SORTABLE
                ? column['getHeaderProps'](column['getSortByToggleProps']())
                : column['getHeaderProps']())}
            >
              <TableColumnHeading
                sx={{ marginRight: column['marginRight'] || '0px' }}
              >
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
    </TableHeadContainer>
  );
};

const TableHeadContainer = styled(TableHead, {
  shouldForwardProp: (prop: string) =>
    prop !== 'expandableTable' && prop !== 'tableVariant',
})(
  ({ expandableTable, tableVariant, theme }: TableHeadContainerProps) => `
  position: relative;
  box-shadow: ${expandableTable ? theme.shape.shadowStandard : ''};
  border-bottom:
    ${
      tableVariant === TABLE_VARIANTS.TOTAL_ROW
        ? theme.shape.borderStandard
        : ''
    };
  margin-right: ${theme.spacing(2.5)};
  ${theme.breakpoints.down('sm')} {
    .sticky-column {
      position: sticky;
      left: 0;
      white-space: normal;
      background: ${theme.palette.background.paper};
      z-index: 2;
    }
  }
`
);

export default DataTableHead;
