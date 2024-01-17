import { HeaderGroup } from 'react-table';
import { ContestTableColumn } from '../types';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { TableColumnHeading } from '../../typography/typography';

interface ContestTableHeadProps {
  headerGroups: Array<HeaderGroup>;
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
        marginRight: '20px',
        '@media (max-width: 1152px)': {
          display: hideOnMobile ? 'none' : 'table-header-group',
        },
      }}
    >
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <TableRow {...headerGroup['getHeaderGroupProps']()}>
          {headerGroup.headers.map((column: ContestTableColumn) => {
            console.log(
              "column['render']('Header'): ",
              column['render']('Header')
            );
            return (
              <TableCell
                sx={{
                  color: theme.palette.borders.accentPaper,
                  padding: theme.spacing(2),
                  textAlign: column['textAlign'] || 'center',
                  borderTop: 'none',
                  borderBottom: 'none',
                  whiteSpace: 'nowrap',
                  width: column['width'] || 'auto',
                  h5: {
                    fontSize: '12px',
                    fontFamily: 'Avenir Next',
                    fontWeight: '500',
                  },
                }}
                {...column['getHeaderProps']()}
              >
                <TableColumnHeading
                  sx={{ marginRight: column['marginRight'] || '0px' }}
                >
                  {column['render']('Header')}
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
