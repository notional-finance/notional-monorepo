import { Box } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  TextWithIconCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { VaultAccount } from '@notional-finance/sdk/src/vaults';
import { useVaultRiskTable } from '../hooks/use-vault-risk-table';
import { defineMessage, FormattedMessage } from 'react-intl';

interface VaultRiskTableProps {
  vaultAddress: string;
  updatedVaultAccount?: VaultAccount;
  hideUpdatedColumn?: boolean;
}

const TABLE_COLUMNS: DataTableColumn[] = [
  {
    Header: (
      <FormattedMessage
        defaultMessage="Risk Type"
        description={'Risk Type header'}
      />
    ),
    Cell: TextWithIconCell,
    accessor: 'riskType',
    textAlign: 'left',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Current"
        description={'Current header'}
      />
    ),
    accessor: 'current',
    textAlign: 'right',
  },
  {
    Header: (
      <FormattedMessage
        defaultMessage="Updated"
        description={'Updated header'}
      />
    ),
    Cell: ArrowIndicatorCell,
    accessor: 'updated',
    textAlign: 'right',
  },
];

export const VaultRiskTable = ({
  vaultAddress,
  updatedVaultAccount,
  hideUpdatedColumn,
}: VaultRiskTableProps) => {
  const { tableData } = useVaultRiskTable(vaultAddress, updatedVaultAccount);

  return (
    <Box>
      <DataTable
        data={tableData}
        columns={hideUpdatedColumn ? TABLE_COLUMNS.slice(0, 2) : TABLE_COLUMNS}
        tableTitle={defineMessage({
          defaultMessage: 'Vault Details',
          description: 'Vault Details Table Title',
        })}
        tableVariant={TABLE_VARIANTS.MINI}
        tableLoading={false}
      />
    </Box>
  );
};
