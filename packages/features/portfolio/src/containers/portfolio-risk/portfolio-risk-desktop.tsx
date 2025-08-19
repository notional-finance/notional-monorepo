import { observer } from 'mobx-react-lite';
import { Box, styled, useTheme } from '@mui/material';
import { Button, DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useMemo } from 'react';
import {
  useAccountDefinition,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { PortfolioPageHeader } from '../../components';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { useVaultRiskTable } from '../../hooks';

const PortfolioRiskDesktop = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const account = useAccountDefinition(network);
  const { riskTableData, riskTableColumns } = useVaultRiskTable();

  const hasVaultRisk = useMemo(
    () => !!account?.balances.find((t) => t.isVaultToken),
    [account?.balances]
  );

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.RISK} />
      <Container>
        {hasVaultRisk && (
          <DataTable
            data={riskTableData}
            columns={[
              ...riskTableColumns,
              {
                cell: ({ row }) => (
                  <ManageButton manageLink={row.original.manageLink} />
                ),
                expandableTable: true,
                accessorKey: 'manage',
                textAlign: 'right',
              },
            ]}
            sx={{
              '& .MuiTableCell-root': {
                padding: theme.spacing(2, 3),
              },
            }}
            tableTitle={
              <Box sx={{ padding: theme.spacing(0, 1) }}>
                <FormattedMessage
                  defaultMessage={'Leveraged Vaults Liquidation Risk'}
                />
              </Box>
            }
          />
        )}
      </Container>
    </Box>
  );
};

const ManageButton = ({ manageLink }: { manageLink: string }) => {
  return (
    <Button variant="contained" color="primary" to={manageLink}>
      <FormattedMessage defaultMessage={'Manage'} />
    </Button>
  );
};

export const Container = styled(Box)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(4)};
    ${theme.breakpoints.down('sm')} {
      margin-top: ${theme.spacing(1)};
    }
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(3)};
  `
);

export default observer(PortfolioRiskDesktop);
