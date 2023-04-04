import { EmptyPortfolio } from '../../components';
import { DataTable } from '@notional-finance/mui';
import { useTransactionHistoryTable } from '../../hooks';
import { FormattedMessage } from 'react-intl';

export const PortfolioTransactionHistory = () => {
  const { txnHistoryData, txnHistoryColumns } = useTransactionHistoryTable();

  return txnHistoryData.length > 0 ? (
    <DataTable
      data={txnHistoryData}
      columns={txnHistoryColumns}
      tableTitle={
        <div>
          <FormattedMessage
            defaultMessage="Recent Transactions"
            description="Recent Transactions Table Title"
          />
        </div>
      }
    />
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioTransactionHistory;
