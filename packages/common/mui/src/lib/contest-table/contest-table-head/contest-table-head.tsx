import { HeaderGroup } from 'react-table';
import { ContestTableColumn } from '../types';
import { TableCell, TableHead, TableRow, useTheme } from '@mui/material';
import { TableColumnHeading } from '../../typography/typography';

interface ContestTableHeadProps {
  headerGroups: Array<HeaderGroup>;
}

export const ContestTableHead = ({ headerGroups }: ContestTableHeadProps) => {
  const theme = useTheme();
  return (
    <TableHead
      sx={{
        position: 'relative',
        boxShadow: '',
        borderBottom: '',
        marginRight: '20px',
      }}
    >
      {headerGroups.map((headerGroup: HeaderGroup) => (
        <TableRow {...headerGroup['getHeaderGroupProps']()}>
          {headerGroup.headers.map((column: ContestTableColumn) => (
            <TableCell
              sx={{
                color: theme.palette.borders.accentPaper,
                padding: theme.spacing(2),
                textAlign: column['textAlign'] || 'center',
                borderTop: 'none',
                borderBottom: 'none',
                whiteSpace: 'nowrap',
                width: column['width'] || 'auto',
              }}
              {...column['getHeaderProps']()}
            >
              <TableColumnHeading
                sx={{ marginRight: column['marginRight'] || '0px' }}
              >
                {column['render']('Header')}
              </TableColumnHeading>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableHead>
  );
};

export default ContestTableHead;
