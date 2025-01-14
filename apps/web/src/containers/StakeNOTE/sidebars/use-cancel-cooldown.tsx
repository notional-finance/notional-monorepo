import { SNOTEWeightedPool } from '@notional-finance/core-entities';
import {
  useAccountDefinition,
  useSubmitTxn,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { useCallback } from 'react';

export function useCancelCoolDown() {
  const { transactionStatus, transactionHash, userWallet } = useWalletStore();
  const submitTxn = useSubmitTxn();
  const account = useAccountDefinition(Network.mainnet);

  const cancelCoolDown = useCallback(async () => {
    if (userWallet?.isReadOnlyAddress || !account) return;
    const populatedTxn = await SNOTEWeightedPool.sNOTE_Contract
      .connect(getProviderFromNetwork(Network.mainnet))
      .populateTransaction.stopCoolDown();

    submitTxn('StopSNOTECooldown', populatedTxn);
  }, [userWallet?.isReadOnlyAddress, account, submitTxn]);

  return {
    cancelCoolDown,
    isReadOnlyAddress: userWallet?.isReadOnlyAddress,
    transactionStatus,
    transactionHash,
  };
}
