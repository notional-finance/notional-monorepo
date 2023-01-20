import { Drawer, PageLoading } from '@notional-finance/mui';
import { TransactionConfirmation } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import { useHistory, useLocation } from 'react-router';
import { useVaultTransaction } from '../../hooks/use-vault-transaction';

export const ConfirmVaultTxn = () => {
  const history = useHistory();
  const { pathname: currentPath } = useLocation();
  const txnData = useVaultTransaction();
  if (!txnData)
    return (
      <Drawer size="large">
        <PageLoading />
      </Drawer>
    );

  return (
    <TransactionConfirmation
      heading={<FormattedMessage {...txnData.transactionHeader} />}
      onCancel={() => history.push(currentPath)}
      transactionProperties={txnData.transactionProperties}
      buildTransactionCall={txnData.buildTransactionCall}
    />
  );
};
