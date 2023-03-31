import { Box } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  TextWithIconCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { VaultAccount } from '@notional-finance/sdk/src/vaults';
import { useVaultDetailsTable } from '../hooks/use-vault-details-table';
import { FormattedMessage } from 'react-intl';

interface VaultDetailsTableProps {
  vaultAddress: string;
  maturity?: string;
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

export const VaultDetailsTable = ({
  vaultAddress,
  maturity,
  updatedVaultAccount,
  hideUpdatedColumn,
}: VaultDetailsTableProps) => {
  const { tableData } = useVaultDetailsTable(vaultAddress, updatedVaultAccount);

  return (
    <Box>
      <DataTable
        data={tableData}
        columns={hideUpdatedColumn ? TABLE_COLUMNS.slice(0, 2) : TABLE_COLUMNS}
        tableTitle={
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <FormattedMessage
                defaultMessage="Vault Details"
                description="Vault Details Table Title"
              />
            </div>
            {maturity && (
              <div>
                <FormattedMessage defaultMessage="Maturity:" /> {maturity}
              </div>
            )}
          </Box>
        }
        tableVariant={TABLE_VARIANTS.MINI}
        tableLoading={false}
      />
    </Box>
  );
};
