import { Drawer, PageLoading } from '@notional-finance/mui';
import { TransactionConfirmation } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { useUnstakeTransaction } from './use-unstake-txn';

export const ConfirmUnstakeView = () => {
  const history = useHistory();
  const { pathname: currentPath } = useLocation();
  const txnProps = useUnstakeTransaction();
  if (!txnProps)
    return (
      <Drawer size="large">
        <PageLoading />
      </Drawer>
    );

  return (
    <TransactionConfirmation
      heading={<FormattedMessage {...txnProps.transactionHeader} />}
      onCancel={() => history.push(currentPath)}
      transactionProperties={txnProps.transactionProperties}
      buildTransactionCall={txnProps.buildTransactionCall}
    />
  );
};
