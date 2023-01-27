import { Drawer } from '@notional-finance/mui';
import { ManageVault } from '../side-bars';

export const VaultActionSideBar = () => {
  //   return   txnData ? (
  //     <TransactionConfirmation
  //       heading={
  //         <FormattedMessage
  //           defaultMessage="Lend Order"
  //           description="section heading"
  //         />
  //       }
  //       onCancel={handleTxnCancel}
  //       transactionProperties={txnData?.transactionProperties}
  //       buildTransactionCall={txnData?.buildTransactionCall}
  //     />
  //   ) : (

  return (
    <Drawer size="large">
      <ManageVault />
    </Drawer>
  );
};
