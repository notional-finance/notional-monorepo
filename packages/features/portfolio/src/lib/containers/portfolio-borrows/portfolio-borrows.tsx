import { DataTable } from '@notional-finance/mui';
import { TableActionRow, EmptyPortfolio } from '../../components';
import { LEND_BORROW } from '@notional-finance/utils';
import { useBorrowTabTable } from './hooks';
import { useAssetSummaryTable } from '../../hooks';

export const PortfolioBorrows = () => {
  const { assetSummaryData, assetSummaryColumns, initialState, setExpandedRows } =
    useAssetSummaryTable(LEND_BORROW.BORROW);
  const { tableData, tableColumns, tabBarProps, CustomTabComponent, isTabComponentVisible } =
    useBorrowTabTable();

  return assetSummaryData.length ? (
    <>
      <DataTable
        data={assetSummaryData}
        columns={assetSummaryColumns}
        CustomRowComponent={TableActionRow}
        initialState={initialState}
        setExpandedRows={setExpandedRows}
      />
      <DataTable
        data={tableData}
        columns={tableColumns}
        tabBarProps={tabBarProps}
        CustomTabComponent={CustomTabComponent}
        TabComponentVisible={isTabComponentVisible}
      />
    </>
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioBorrows;
