import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useTxnHistoryTable,
  useTxnHistoryDropdowns,
  useTxnHistoryData,
} from './hooks';
import { Box } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { PortfolioPageHeader } from '../../components';
import { observer } from 'mobx-react-lite';

export const PortfolioTransactionHistory = observer(() => {
  const {
    accountHistoryData,
    allCurrencyOptions,
    allAssetOrVaultOptions,
    pendingTokenData,
  } = useTxnHistoryData();

  const { dropdownsData, currencyOptions, assetOrVaultOptions } =
    useTxnHistoryDropdowns(allCurrencyOptions, allAssetOrVaultOptions);

  const { txnHistoryData, txnHistoryColumns, marketDataCSVFormatter } =
    useTxnHistoryTable(
      currencyOptions,
      assetOrVaultOptions,
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
        pendingMessage={
          <FormattedMessage defaultMessage={'Calculating transaction'} />
        }
        pendingTokenData={pendingTokenData}
        csvDataFormatter={marketDataCSVFormatter}
      />
    </Box>
  );
});

export default PortfolioTransactionHistory;
