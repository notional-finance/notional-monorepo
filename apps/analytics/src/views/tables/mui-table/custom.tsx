import { ReactNode } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow, { TableRowProps } from '@mui/material/TableRow';

// project imports
import { header } from './basic';
import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/react-table';

interface StyledTableCellProps extends TableCellProps {
  children: ReactNode;
}

interface StyledTableRowProps extends TableRowProps {
  children: ReactNode;
}

// styles
function StyledTableCell({ children, sx, ...others }: StyledTableCellProps) {
  return (
    <TableCell
      sx={{
        ['&.MuiTableCell-head']: { bgcolor: 'common.black', color: 'common.white' },
        ['&.MuiTableCell-body']: { fontSize: 'o.875rem' },
        ...sx
      }}
      {...others}
    >
      {children}
    </TableCell>
  );
}
function StyledTableRow({ children, ...others }: StyledTableRowProps) {
  return (
    <TableRow sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' }, '&:last-of-type td, &:last-of-type th': { border: 0 } }} {...others}>
      {children}
    </TableRow>
  );
}

// table data
function createData(name: string, calories: number, fat: number, carbs: number, protein: number) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9)
];

// ==============================|| MUI TABLE - CUSTOMIZED ||============================== //

export default function CustomizedTables() {
  return (
    <MainCard
      content={false}
      title="Customized Tables"
      secondary={<CSVExport data={rows} headers={header} filename={'customized-table-data.csv'} />}
    >
      <TableContainer>
        <Table sx={{ minWidth: 320 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ pl: 3 }}>Dessert (100g serving)</StyledTableCell>
              <StyledTableCell align="right">Calories</StyledTableCell>
              <StyledTableCell align="right">Fat&nbsp;(g)</StyledTableCell>
              <StyledTableCell align="right">Carbs&nbsp;(g)</StyledTableCell>
              <StyledTableCell sx={{ pr: 3 }} align="right">
                Protein&nbsp;(g)
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <StyledTableRow hover key={row.name}>
                <StyledTableCell sx={{ pl: 3 }} component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="right">{row.calories}</StyledTableCell>
                <StyledTableCell align="right">{row.fat}</StyledTableCell>
                <StyledTableCell align="right">{row.carbs}</StyledTableCell>
                <StyledTableCell sx={{ pr: 3 }} align="right">
                  {row.protein}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
