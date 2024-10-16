import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { TableColumnHeading } from '../../typography/typography';

interface ContestTableHeadProps {
  headerGroups: any[];
  hideOnMobile?: boolean;
}

export const ContestTableHead = ({
  headerGroups,
  hideOnMobile,
}: ContestTableHeadProps) => {
  const theme = useTheme();

  return (
    <TableHead
      sx={{
        position: 'relative',
        boxShadow: '',
        borderBottom: '',
        '@media (max-width: 1152px)': {
          display: hideOnMobile ? 'none' : 'table-header-group',
        },
      }}
    >
      {headerGroups.map((headerGroup, i) => (
        <TableRow key={`head-row-${i}`}>
          {headerGroup.headers.map((header: any, i: number) => {
            return (
              <TableCell
                key={`head-cell-${i}`}
                sx={{
                  color: theme.palette.borders.accentPaper,
                  padding: header.column.columnDef.padding || theme.spacing(2),
                  textAlign: header.column.columnDef.textAlign || 'center',
                  borderTop: 'none',
                  borderBottom: 'none',
                  whiteSpace: 'nowrap',
                  width: header.column.columnDef.width || header.getSize(),
                  h5: {
                    fontSize: '12px',
                    fontFamily: 'Avenir Next',
                    fontWeight: '600',
                  },
                }}
              >
                <TableColumnHeading
                  sx={{
                    marginRight: header.column.columnDef.marginRight || '0px',
                  }}
                >
                  {header.column.columnDef.header}
                </TableColumnHeading>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default ContestTableHead;
