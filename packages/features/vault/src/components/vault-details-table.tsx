import { Box, useTheme } from '@mui/material';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  DataTableColumn,
  ErrorMessage,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useVaultDetailsTable } from '../hooks/use-vault-details-table';
import { tradeErrors } from '@notional-finance/trade';

interface VaultDetailsTableProps {
  hideUpdatedColumn?: boolean;
}

const TABLE_COLUMNS: DataTableColumn[] = [
  {
    Header: (
      <FormattedMessage defaultMessage="Detail" description={'Detail header'} />
    ),
    accessor: 'label',
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
  hideUpdatedColumn,
}: VaultDetailsTableProps) => {
  const theme = useTheme();
  const { tableData, maturity, tooRisky } = useVaultDetailsTable();

  return (
    <Box>
      {tooRisky && !hideUpdatedColumn && (
        <ErrorMessage
          variant="error"
          title={<FormattedMessage {...tradeErrors.liquidationRisk} />}
          message={
            <FormattedMessage {...tradeErrors.leverageLiquidationRiskMsg} />
          }
          marginBottom
        />
      )}
      <DataTable
        sx={{
          border: tooRisky
            ? `1px solid ${theme.palette.error.main}`
            : theme.shape.borderStandard,
        }}
        data={tableData}
        columns={hideUpdatedColumn ? TABLE_COLUMNS.slice(0, 2) : TABLE_COLUMNS}
        stateZeroMessage={
          <FormattedMessage defaultMessage="Input parameters to see your vault details." />
        }
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
                <FormattedMessage
                  defaultMessage="Maturity: {maturity}"
                  values={{ maturity }}
                />
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
