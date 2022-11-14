import { DataTable } from '@notional-finance/mui';
import { VaultActionRow, EmptyPortfolio } from '../../components';
import { usePortfolioVaults } from './hooks/use-portfolio-vaults';

export const PortfolioVaults = () => {
  const { vaultSummaryData, vaultSummaryColumns, initialState, setExpandedRows } =
    usePortfolioVaults();
  return vaultSummaryData.length ? (
    <DataTable
      data={vaultSummaryData}
      columns={vaultSummaryColumns}
      CustomRowComponent={VaultActionRow}
      initialState={initialState}
      setExpandedRows={setExpandedRows}
    />
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioVaults;
