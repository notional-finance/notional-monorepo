import {
  useAccountDefinition,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import {
  DisablePrimeBorrow,
  EnablePrimeBorrow,
} from '@notional-finance/transaction';
import { Network } from '@notional-finance/util';
import { useCallback } from 'react';

export function useEnablePrimeBorrow(network: Network) {
  const account = useAccountDefinition(network);
  // Set the default to true so that this does not show up for non-connected wallets
  const isPrimeBorrowAllowed = account ? account.allowPrimeBorrow : true;
  const { isReadOnlyAddress, transactionStatus, onSubmit } =
    useTransactionStatus(network);

  const enablePrimeBorrow = useCallback(async () => {
    if (network && account?.address) {
      const txn = EnablePrimeBorrow({
        address: account.address,
        network,
        redeemToWETH: false,
        accountBalances: [],
        maxWithdraw: false,
      });
      onSubmit('EnablePrimeBorrow', await txn);
    }
  }, [network, account?.address, onSubmit]);

  const disablePrimeBorrow = useCallback(async () => {
    if (network && account?.address) {
      const txn = DisablePrimeBorrow({
        address: account.address,
        network,
        redeemToWETH: false,
        accountBalances: [],
        maxWithdraw: false,
      });
      onSubmit('DisablePrimeBorrow', await txn);
    }
  }, [network, account?.address, onSubmit]);

  return {
    enablePrimeBorrow,
    disablePrimeBorrow,
    isPrimeBorrowAllowed,
    variableBorrowTxnStatus: transactionStatus,
    isSignerConnected: account && !isReadOnlyAddress,
  };
}
