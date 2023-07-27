import { Box } from '@mui/material';
import { DataTable } from '@notional-finance/mui';
import { VaultActionRow } from '../../components';
import { FormattedMessage } from 'react-intl';
// import { useRiskOverviewTable } from '../portfolio-overview/hooks/use-risk-overview-table';
// import { usePortfolioVaults } from './hooks/use-portfolio-vaults';
import { useVaultHoldingsTable } from '../../hooks';

export const PortfolioVaults = () => {
  // const {
  //   vaultSummaryData,
  //   vaultSummaryColumns,
  //   initialState,
  //   setExpandedRows,
  // } = usePortfolioVaults();

  const {
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    initialState,
  } = useVaultHoldingsTable();

  console.log({ vaultHoldingsData });
  console.log({ vaultHoldingsColumns });

  // if (vaultSummaryData.length === 0) {
  //   return <EmptyPortfolio />;
  // }

  return (
    <Box>
      <DataTable
        data={vaultHoldingsData}
        columns={vaultHoldingsColumns}
        CustomRowComponent={VaultActionRow}
        tableTitle={
          <div>
            <FormattedMessage
              defaultMessage="Leveraged Vaults"
              description="table title"
            />
          </div>
        }
        initialState={initialState}
        setExpandedRows={setExpandedRows}
      />
      {/* {vaultRiskData.length > 0 && (
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <DataTable
            data={vaultRiskData}
            columns={riskOverviewColumns.concat({
              Header: (
                <FormattedMessage
                  defaultMessage="Leverage"
                  description={'Leverage header'}
                />
              ),
              expandableTable: true,
              Cell: SliderCell,
              accessor: 'leveragePercentage',
              textAlign: 'right',
            })}
            tableTitle={
              <div>
                <FormattedMessage
                  defaultMessage="Vault Risk Overview"
                  description="table title"
                />
              </div>
            }
          />
        </Box>
      )} */}
    </Box>
  );
};

export default PortfolioVaults;
