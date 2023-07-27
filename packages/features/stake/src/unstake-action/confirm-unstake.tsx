import { Drawer, PageLoading } from '@notional-finance/mui';
import { useUnstakeTransaction } from './use-unstake-txn';

export const ConfirmUnstakeView = () => {
  const txnProps = useUnstakeTransaction();
  if (!txnProps)
    return (
      <Drawer size="large">
        <PageLoading />
      </Drawer>
    );

  return <PageLoading />;
};
