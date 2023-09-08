import { useEffect, useState } from 'react';
import { DataTable, ButtonBar } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import {
  useTxnHistoryTable,
  useTxnHistoryButtonBar,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from './hooks';

export const PortfolioTransactionHistory = () => {
  const { search } = useLocation();
  const [txnHistoryType, setTxnHistoryType] = useState<TXN_HISTORY_TYPE>(
    TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
  );
  const { accountHistoryData, allCurrencyOptions, allAssetOrVaultOptions } =
    useTxnHistoryData(txnHistoryType);
  const buttonData = useTxnHistoryButtonBar(setTxnHistoryType, txnHistoryType);
  const {
    dropdownsData,
    currencyOptions,
    assetOrVaultOptions,
    clearQueryAndFilters,
  } = useTxnHistoryDropdowns(
    txnHistoryType,
    allCurrencyOptions,
    allAssetOrVaultOptions
  );

  const { txnHistoryData, txnHistoryColumns, marketDataCSVFormatter } =
    useTxnHistoryTable(
      currencyOptions,
      assetOrVaultOptions,
      txnHistoryType,
      accountHistoryData
    );

  useEffect(() => {
    const queryParams = new URLSearchParams(search);
    if (queryParams && queryParams.get('txnHistoryType')) {
      const historyType = queryParams.get('txnHistoryType') as TXN_HISTORY_TYPE;
      setTxnHistoryType(historyType);
    }
  }, [search, txnHistoryType, dropdownsData, allAssetOrVaultOptions]);

  return (
    <>
      {buttonData.length > 0 && (
        <ButtonBar buttonOptions={buttonData} buttonVariant="outlined" />
      )}

      <DataTable
        data={txnHistoryData || []}
        columns={txnHistoryColumns}
        filterBarData={dropdownsData}
        clearQueryAndFilters={clearQueryAndFilters}
        marketDataCSVFormatter={marketDataCSVFormatter}
      />
    </>
  );
};

export default PortfolioTransactionHistory;
