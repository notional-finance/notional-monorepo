import { FormattedMessage } from 'react-intl';
import { useVaultReinvestmentTable } from '../hooks';
import { DataTable } from '@notional-finance/mui';
import { Box, useTheme } from '@mui/material';
import { useContext } from 'react';
import { VaultActionContext } from '../vault';
import { getVaultType } from '@notional-finance/core-entities';

export const VaultReinvestmentHistory = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { selectedNetwork, deposit, vaultAddress } = state;
  const { reinvestmentTableData, reinvestmentTableColumns } =
    useVaultReinvestmentTable(selectedNetwork, deposit, vaultAddress);
  const vaultType =
    vaultAddress && selectedNetwork
      ? getVaultType(vaultAddress, selectedNetwork)
      : undefined;

  return vaultType === 'SingleSidedLP_AutoReinvest' ? (
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
