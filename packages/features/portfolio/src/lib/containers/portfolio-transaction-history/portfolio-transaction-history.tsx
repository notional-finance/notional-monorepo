import { EmptyPortfolio } from '../../components';
import { DataTable } from '@notional-finance/mui';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/utils';
import { useTransactionHistoryTable } from '../../hooks';
import { defineMessage } from 'react-intl';

export const PortfolioTransactionHistory = () => {
  const { txnHistoryData, txnHistoryColumns } = useTransactionHistoryTable();

  return txnHistoryData.length > 0 ? (
    <DataTable
      data={txnHistoryData}
      columns={txnHistoryColumns}
      tableTitle={defineMessage({
        defaultMessage: 'Recent Transactions',
        description: 'Recent Transactions Table Title',
      })}
    />
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioTransactionHistory;
