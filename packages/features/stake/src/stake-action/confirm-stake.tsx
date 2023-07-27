import { Drawer, PageLoading } from '@notional-finance/mui';
import { useStakeTransaction } from './use-stake-txn';

export const ConfirmStakeView = () => {
  const txnProps = useStakeTransaction();
  if (!txnProps)
    return (
      <Drawer size="large">
        <PageLoading />
      </Drawer>
    );

  return (
    <PageLoading />
    // <TransactionConfirmation
    //   heading={<FormattedMessage {...txnProps.transactionHeader} />}
    //   onCancel={() => history.push(currentPath)}
    //   transactionProperties={txnProps.transactionProperties}
    //   buildTransactionCall={txnProps.buildTransactionCall}
    // />
  );
};
