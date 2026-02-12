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
import { useAllVaults, useAppStore } from '@notional-finance/notionable-hooks';
import { VaultRow } from './VaultRow';

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
  const vaults = useAllVaults();
  const { baseCurrency } = useAppStore();

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
          borderSpacing: `0 ${theme.spacing(1)}`,
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
            <TableCell
              sx={{ padding: theme.spacing(2, 1), textAlign: 'right' }}
            >
              <H5 gutter="none">Rewards</H5>
            </TableCell>
            <TableCell
              sx={{ padding: theme.spacing(2, 1), textAlign: 'right' }}
            >
              <H5 gutter="none">Points</H5>
            </TableCell>
            <TableCell
              sx={{ padding: theme.spacing(2, 3), textAlign: 'right' }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  width: '100%',
                }}
              >
                <H5 gutter="none">Max APY</H5>
                <SortIndicator />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaults
            .filter((vault) => vault.vaultConfig.isVisible)
            .map((vault) => (
              <VaultRow
                key={vault.vaultConfig.vaultAddress}
                vault={vault}
                baseCurrency={baseCurrency}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
