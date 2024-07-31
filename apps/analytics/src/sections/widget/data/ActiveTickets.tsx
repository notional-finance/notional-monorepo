// next
import NextLink from 'next/link';

// material-ui
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

// assets
const Avatar1 = '/assets/images/users/avatar-1.png';
const Avatar2 = '/assets/images/users/avatar-2.png';
const Avatar3 = '/assets/images/users/avatar-3.png';
const Avatar4 = '/assets/images/users/avatar-4.png';

// table data
function createData(time: string, subTime: string, avatar: string, name: string, title: string, subtext: string) {
  return { time, subTime, avatar, name, title, subtext };
}

const rows = [
  createData(
    '12',
    'hours',
    Avatar1,
    'John Deo',
    '[#1183] Workaround for OS X selects printing bug',
    'Chrome fixed the bug several versions ago, thus rendering this...'
  ),
  createData(
    '16',
    'hours',
    Avatar2,
    'Jems Win',
    '[#1249] Vertically center carousel controls',
    'Try any carousel control and reduce the screen width below...'
  ),
  createData(
    '40',
    'hours',
    Avatar3,
    'Jeny Wiliiam',
    '[#1254] Inaccurate small pagination height',
    'The height of pagination elements is not consistent with...'
  ),
  createData(
    '12',
    'hours',
    Avatar4,
    'Jems Win',
    '[#1249] Vertically center carousel controls',
    'Try any carousel control and reduce the screen width below...'
  )
];

// ==========================|| DATA WIDGET - ACTIVE TICKETS ||========================== //

export default function ActiveTickets() {
  return (
    <MainCard
      title="Active Tickets"
      content={false}
      secondary={
        <NextLink href="#" passHref legacyBehavior>
          <Link color="primary">View all</Link>
        </NextLink>
      }
    >
      <TableContainer>
        <Table sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">Due</TableCell>
              <TableCell>Name</TableCell>
              <TableCell sx={{ pr: 3 }}>Position</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow hover key={index}>
                <TableCell align="center">
                  <Typography variant="subtitle1">{row.time}</Typography>
                  <Typography variant="subtitle2" color="secondary">
                    {row.subTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Grid container spacing={2} alignItems="center" sx={{ flexWrap: 'nowrap' }}>
                    <Grid item>
                      <Avatar alt="User 1" src={row.avatar} />
                    </Grid>
                    <Grid item xs zeroMinWidth>
                      <Typography variant="subtitle1">{row.name}</Typography>
                    </Grid>
                  </Grid>
                </TableCell>
                <TableCell sx={{ pr: 3 }}>
                  <Typography variant="subtitle1">{row.title}</Typography>
                  <Typography variant="caption" color="secondary">
                    {row.subtext}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
