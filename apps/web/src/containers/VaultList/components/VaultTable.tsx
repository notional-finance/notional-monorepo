import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { ArrowIcon } from '@notional-finance/icons';
import { H5 } from '@notional-finance/mui';

const SortIndicator = () => {
  const theme = useTheme();

  return (
    <Box
      aria-hidden
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
      }}
    >
      <ArrowIcon
        sx={{
          width: theme.spacing(1),
          height: theme.spacing(1),
          color: theme.palette.typography.light,
          transform: 'rotate(0deg)',
        }}
      />
      <ArrowIcon
        sx={{
          width: theme.spacing(1),
          height: theme.spacing(1),
          color: theme.palette.typography.light,
          transform: 'rotate(180deg)',
        }}
      />
    </Box>
  );
};

export const VaultTable = () => {
  const theme = useTheme();

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 'none',
        background: 'transparent',
        marginTop: theme.spacing(1),
      }}
    >
      <Table
        sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed',
          '& .MuiTableCell-root': {
            borderBottom: 'none',
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              height: theme.spacing(6.5),
              backgroundColor: theme.palette.common.white,
              '& .MuiTableCell-root:first-of-type': {
                borderTopLeftRadius: theme.shape.borderRadius(),
                borderBottomLeftRadius: theme.shape.borderRadius(),
                width: '33%',
              },
              '& .MuiTableCell-root:last-of-type': {
                borderTopRightRadius: theme.shape.borderRadius(),
                borderBottomRightRadius: theme.shape.borderRadius(),
              },
            }}
          >
            <TableCell sx={{ padding: theme.spacing(2, 3) }}>
              <H5 gutter="none">Vault</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Yield Token</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <H5 gutter="none">Available Liquidity</H5>
                <SortIndicator />
              </Box>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Rewards</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Points</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 3), textAlign: 'left' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <H5 gutter="none">Max APY</H5>
                <SortIndicator />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))} */}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
