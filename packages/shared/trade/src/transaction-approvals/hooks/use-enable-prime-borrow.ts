import {
  useAccountDefinition,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import {
  DisablePrimeBorrow,
  EnablePrimeBorrow,
} from '@notional-finance/transaction';
import { Network } from '@notional-finance/util';
import { useCallback } from 'react';

export function useEnablePrimeBorrow(network: Network | undefined) {
  const account = useAccountDefinition(network);
  // Set the default to true so that this does not show up for non-connected wallets
  const isPrimeBorrowAllowed = account ? account.allowPrimeBorrow : true;
  const { userWallet, transactionStatus, submitTxn } = useWalletStore();

  const enablePrimeBorrow = useCallback(async () => {
    if (network && account?.address) {
      const txn = EnablePrimeBorrow({
        address: account.address,
        network,
        redeemToWETH: false,
        accountBalances: [],
        maxWithdraw: false,
      });
      submitTxn('EnablePrimeBorrow', await txn);
    }
  }, [network, account?.address, submitTxn]);

  const disablePrimeBorrow = useCallback(async () => {
    if (network && account?.address) {
      const txn = DisablePrimeBorrow({
        address: account.address,
        network,
        redeemToWETH: false,
        accountBalances: [],
        maxWithdraw: false,
      });
      submitTxn('DisablePrimeBorrow', await txn);
    }
  }, [network, account?.address, submitTxn]);

  return {
    enablePrimeBorrow,
    disablePrimeBorrow,
    isPrimeBorrowAllowed,
    variableBorrowTxnStatus: transactionStatus,
    isSignerConnected: account && !userWallet?.isReadOnlyAddress,
  };
}
