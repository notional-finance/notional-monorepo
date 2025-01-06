import { FormattedMessage } from 'react-intl';
import { useVaultReinvestmentTable } from '../hooks';
import { DataTable } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';

export const VaultReinvestmentHistory = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const vaultType = trade?.vaultType;
  const { deposit } = trade?.selectedTokens ?? {};
  const selectedNetwork = trade?.selectedNetwork;
  const vaultAddress = trade?.vaultAddress;
  const { reinvestmentTableData, reinvestmentTableColumns } =
    useVaultReinvestmentTable(selectedNetwork, deposit, vaultAddress);

  return (vaultType === 'SingleSidedLP_AutoReinvest' ||
    vaultType === 'SingleSidedLP_Points') &&
    reinvestmentTableData &&
    reinvestmentTableData.length > 0 ? (
    <Box
      sx={{
        marginBottom: theme.spacing(5),
        marginTop: theme.spacing(5),
      }}
    >
      <DataTable
        tableTitle={
          <FormattedMessage defaultMessage={'Vault Reinvestment History'} />
        }
        data={reinvestmentTableData}
        maxHeight={theme.spacing(51)}
        columns={reinvestmentTableColumns}
      />
    </Box>
  ) : null;
};
