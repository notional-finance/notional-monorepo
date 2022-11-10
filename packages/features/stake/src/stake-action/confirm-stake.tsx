import { Drawer, PageLoading } from '@notional-finance/mui';
import { TransactionConfirmation } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { useStakeTransaction } from './use-stake-txn';

export const ConfirmStakeView = () => {
  const history = useHistory();
  const { pathname: currentPath } = useLocation();
  const txnProps = useStakeTransaction();
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
