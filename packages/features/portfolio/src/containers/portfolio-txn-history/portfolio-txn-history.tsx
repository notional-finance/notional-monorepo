import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useTxnHistoryTable,
  useTxnHistoryCategory,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from './hooks';
import { Box } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { PortfolioPageHeader } from '../../components';
import { observer } from 'mobx-react-lite';

export const PortfolioTransactionHistory = () => {
  const rightToggleData = useTxnHistoryCategory();
  const txnHistoryCategory = rightToggleData?.toggleKey || 0;

  const {
    accountHistoryData,
    allCurrencyOptions,
    allAssetOrVaultOptions,
    pendingTokenData,
  } = useTxnHistoryData(txnHistoryCategory);

  const { dropdownsData, currencyOptions, assetOrVaultOptions } =
    useTxnHistoryDropdowns(
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
    <Box>
      <PortfolioPageHeader
        category={PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}
      />
      <DataTable
        data={txnHistoryData || []}
        columns={txnHistoryColumns}
        filterBarData={dropdownsData}
        rightToggleData={rightToggleData}
        pendingMessage={
          <FormattedMessage defaultMessage={'Calculating transaction'} />
        }
        pendingTokenData={pendingTokenData}
        csvDataFormatter={marketDataCSVFormatter}
      />
    </Box>
  );
};

export default observer(PortfolioTransactionHistory);
