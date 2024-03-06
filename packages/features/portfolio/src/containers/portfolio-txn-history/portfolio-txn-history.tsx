import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useTxnHistoryTable,
  useTxnHistoryCategory,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from './hooks';

export const PortfolioTransactionHistory = () => {
  const rightToggleData = useTxnHistoryCategory();
  const txnHistoryCategory = rightToggleData?.toggleKey || 0;

  const {
    accountHistoryData,
    allCurrencyOptions,
    allAssetOrVaultOptions,
    pendingTokenData,
  } = useTxnHistoryData(txnHistoryCategory);

  const {
    dropdownsData,
    currencyOptions,
    assetOrVaultOptions,
    clearQueryAndFilters,
  } = useTxnHistoryDropdowns(
    txnHistoryCategory,
    allCurrencyOptions,
    allAssetOrVaultOptions
  );

  const { txnHistoryData, txnHistoryColumns, marketDataCSVFormatter } =
    useTxnHistoryTable(
      currencyOptions,
      assetOrVaultOptions,
      txnHistoryCategory,
      accountHistoryData
    );

  return (
    <DataTable
      data={txnHistoryData || []}
      columns={txnHistoryColumns}
      filterBarData={dropdownsData}
      rightToggleData={rightToggleData}
      pendingMessage={
        <FormattedMessage defaultMessage={'Calculating transaction'} />
      }
      pendingTokenData={pendingTokenData}
      clearQueryAndFilters={clearQueryAndFilters}
      csvDataFormatter={marketDataCSVFormatter}
    />
  );
};

export default PortfolioTransactionHistory;
