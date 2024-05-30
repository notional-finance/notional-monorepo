import { SNOTEWeightedPool } from '@notional-finance/core-entities';
import {
  useAccountDefinition,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { useCallback } from 'react';

export function useCancelCoolDown() {
  const { isReadOnlyAddress, onSubmit, transactionStatus, transactionHash } =
    useTransactionStatus(Network.mainnet);
  const account = useAccountDefinition(Network.mainnet);

  const cancelCoolDown = useCallback(async () => {
    if (isReadOnlyAddress || !account) return;
    const populatedTxn = await SNOTEWeightedPool.sNOTE_Contract
      .connect(getProviderFromNetwork(Network.mainnet))
      .populateTransaction.stopCoolDown();

    onSubmit('StopSNOTECooldown', populatedTxn);
  }, [isReadOnlyAddress, account, onSubmit]);

  return {
    cancelCoolDown,
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
  };
}
