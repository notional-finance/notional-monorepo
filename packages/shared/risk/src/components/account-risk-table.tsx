import { styled, Box } from '@mui/material';
import { AccountData } from '@notional-finance/sdk';
import {
  ArrowIndicatorCell,
  DataTable,
  TABLE_VARIANTS,
  TextWithIconCell,
  DataTableColumn,
} from '@notional-finance/mui';
import { useLiquidationRiskTable } from '../hooks/use-liquidation-risk-table';
import { FormattedMessage } from 'react-intl';

interface RiskDataTableProps {
  updatedAccountData?: AccountData;
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

export const AccountRiskTable = ({
  updatedAccountData,
}: RiskDataTableProps) => {
  const { tableData } = useLiquidationRiskTable(updatedAccountData);

  return (
    <AccountRiskTableContainer>
      <DataTable
        data={tableData}
        columns={TABLE_COLUMNS}
        tableTitle={
          <div>
            <FormattedMessage
              defaultMessage="Liquidation Risk Breakdown"
              description="Liquidation Risk Breakdown Table Title"
            />
          </div>
        }
        tableVariant={TABLE_VARIANTS.MINI}
      />
    </AccountRiskTableContainer>
  );
};

const AccountRiskTableContainer = styled(Box)(
  ({ theme }) => `
  ${theme.breakpoints.down('sm')} {
    max-width: 95vw;
  }
`
);
