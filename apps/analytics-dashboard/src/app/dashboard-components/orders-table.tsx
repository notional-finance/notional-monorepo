// material-ui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';

// project import
// import Dot from 'components/@extended/Dot';
// import { NumericFormat } from 'components/third-party';

// assets
// import { ColorProps } from '../types/extended';

// types
interface Data {
  name: string;
  carbs: number;
  fat: number;
  tracking_no: number;
  protein: number;
}

function createData(
  tracking_no: number,
  name: string,
  fat: number,
  carbs: number,
  protein: number
): Data {
  return { tracking_no, name, fat, carbs, protein };
}

const rows = [
  createData(84564564, 'Camera Lens', 40, 2, 40570),
  createData(98764564, 'Laptop', 300, 0, 180139),
  createData(98756325, 'Mobile', 355, 1, 90989),
  createData(98652366, 'Handset', 50, 1, 10239),
  createData(13286564, 'Computer Accessories', 100, 1, 83348),
  createData(86739658, 'TV', 99, 0, 410780),
  createData(13256498, 'Keyboard', 125, 2, 70999),
  createData(98753263, 'Mouse', 89, 2, 10570),
  createData(98753275, 'Desktop', 185, 1, 98063),
  createData(98753291, 'Chair', 100, 0, 14001),
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// ==============================|| ORDER TABLE - HEADER CELL ||============================== //

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  align: 'center' | 'left' | 'right' | 'inherit' | 'justify' | undefined;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'tracking_no',
    align: 'left',
    disablePadding: false,
    label: 'Tracking No.',
  },
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Product Name',
  },
  {
    id: 'fat',
    align: 'right',
    disablePadding: false,
    label: 'Total Order',
  },
  {
    id: 'carbs',
    align: 'left',
    disablePadding: false,

    label: 'Status',
  },
  {
    id: 'protein',
    align: 'right',
    disablePadding: false,
    label: 'Total Amount',
  },
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

interface OrderTableHeadProps {
  order: Order;
  orderBy: string;
}

function OrderTableHead({ order, orderBy }: OrderTableHeadProps) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// ==============================|| ORDER TABLE - STATUS ||============================== //

// interface Props {
//   status: number;
// }

// function OrderStatus({ status }: Props) {
//   //   let color: ColorProps;
//   let title: string;

//   //   switch (status) {
//   //     case 0:
//   //       color = 'warning';
//   //       title = 'Pending';
//   //       break;
//   //     case 1:
//   //       color = 'success';
//   //       title = 'Approved';
//   //       break;
//   //     case 2:
//   //       color = 'error';
//   //       title = 'Rejected';
//   //       break;
//   //     default:
//   //       color = 'primary';
//   //       title = 'None';
//   //   }

//   return (
//     <Stack direction="row" spacing={1} alignItems="center">
//       {/* <Dot color={color} /> */}
//       <Typography>{title}</Typography>
//     </Stack>
//   );
// }

// ==============================|| ORDER TABLE ||============================== //

export default function OrderTable() {
  const order: Order = 'asc';
  const orderBy: keyof Data = 'tracking_no';

  return (
    <Box>
      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          display: 'block',
          maxWidth: '100%',
          '& td, & th': { whiteSpace: 'nowrap' },
        }}
      >
        <Table aria-labelledby="tableTitle">
          <OrderTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map(
              (row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    tabIndex={-1}
                    key={row.tracking_no}
                  >
                    <TableCell component="th" id={labelId} scope="row">
                      <Link color="secondary">{row.tracking_no}</Link>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell>
                      {/* <OrderStatus status={row.carbs} /> */}
                    </TableCell>
                    <TableCell align="right">
                      {row.protein}
                      {/* <NumericFormat
                        value={row.protein}
                        displayType="text"
                        thousandSeparator
                        prefix="$"
                      /> */}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
