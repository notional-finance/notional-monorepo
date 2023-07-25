import { useState } from 'react';
import { DataTable, ButtonBar, TABLE_VARIANTS } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import {
  useTxnHistoryTable,
  useTxnHistoryButtonBar,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from '../../hooks';

export const PortfolioTransactionHistory = () => {
  const [txnHistoryType, setTxnHistoryType] = useState<TXN_HISTORY_TYPE>(
    TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
  );
  const { accountHistoryData, allCurrencyOptions, allAssetOrVaultOptions } =
    useTxnHistoryData(txnHistoryType);
  const buttonData = useTxnHistoryButtonBar(setTxnHistoryType, txnHistoryType);
  const { dropdownsData, currencyOptions, assetOrVaultOptions } =
    useTxnHistoryDropdowns(
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

  return (
    <>
      {buttonData.length > 0 && (
        <ButtonBar buttonOptions={buttonData} buttonVariant="outlined" />
      )}

      <DataTable
        data={txnHistoryData || []}
        columns={txnHistoryColumns}
        filterBarData={dropdownsData}
        marketDataCSVFormatter={marketDataCSVFormatter}
      />
    </>
  );
};

export default PortfolioTransactionHistory;
