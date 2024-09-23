// next
import NextLink from 'next/link';

// material-ui
import CardMedia from '@mui/material/CardMedia';
import Chip, { ChipProps } from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';

const Phone1 = '/assets/images/widget/PHONE1.jpg';
const Phone2 = '/assets/images/widget/PHONE2.jpg';
const Phone3 = '/assets/images/widget/PHONE3.jpg';
const Phone4 = '/assets/images/widget/PHONE4.jpg';

// table data
function createData(
  customer: string,
  cid: string,
  photo: string,
  product: string,
  quantity: string,
  date: string,
  status: string,
  statuscolor: ChipProps['color']
) {
  return { customer, cid, photo, product, quantity, date, status, statuscolor };
}

const rows = [
  createData('John Deo', '#81412314', Phone1, 'Moto G5', '10', '17-2-2017', 'Pending', 'warning'),
  createData('Jenny William', '#68457898', Phone2, 'iPhone 8', '16', '20-2-2017', 'Paid', 'primary'),
  createData('Lori Moore', '#45457898', Phone3, 'Redmi 4', '20', '17-2-2017', 'Success', 'success'),
  createData('Austin Pena', '#62446232', Phone4, 'Jio', '15', '25-4-2017', 'Failed', 'error')
];

// =========================|| DATA WIDGET - LATEST ORDER ||========================= //

export default function LatestOrder() {
  return (
    <MainCard
      title="Latest Order"
      content={false}
      secondary={
        <NextLink href="#" passHref legacyBehavior>
          <Link color="primary">View all</Link>
        </NextLink>
      }
    >
      <TableContainer>
        <Table sx={{ minWidth: 350 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>Customer</TableCell>
              <TableCell>Order Id</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Product</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center" sx={{ pr: 3 }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell sx={{ pl: 3 }}>{row.customer}</TableCell>
                <TableCell>{row.cid}</TableCell>
                <TableCell>
                  <CardMedia component="img" image={row.photo} title="image" sx={{ width: 20, height: 'auto' }} />
                </TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="center">{row.date}</TableCell>
                <TableCell align="center">
                  <Chip color={row.statuscolor} label={row.status} size="small" />
                </TableCell>
                <TableCell align="center" sx={{ pr: 3 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center">
                    <IconButton color="primary" size="large">
                      <EditOutlined />
                    </IconButton>
                    <IconButton color="inherit" size="large">
                      <DeleteOutlined />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
