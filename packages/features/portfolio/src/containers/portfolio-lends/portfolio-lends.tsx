import { DataTable } from '@notional-finance/mui';
import { TableActionRow, EmptyPortfolio } from '../../components';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { useAssetSummaryTable } from '../../hooks';

export const PortfolioLends = () => {
  const {
    assetSummaryData,
    assetSummaryColumns,
    initialState,
    setExpandedRows,
  } = useAssetSummaryTable(LEND_BORROW.LEND);

  return assetSummaryData.length ? (
    <DataTable
      data={assetSummaryData}
      columns={assetSummaryColumns}
      CustomRowComponent={TableActionRow}
      initialState={initialState}
      setExpandedRows={setExpandedRows}
    />
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioLends;
