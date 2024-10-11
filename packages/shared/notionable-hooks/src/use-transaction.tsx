import { trackEvent } from '@notional-finance/helpers';
import { logError, TRACKING_EVENTS, Network } from '@notional-finance/util';
import { ethers, PopulatedTransaction } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useNotionalContext } from './use-notional';
import { useLocation } from 'react-router';
import { TokenDefinition } from '@notional-finance/core-entities';
import { useWalletStore } from '@notional-finance/notionable';
import { useConnectWallet } from '@web3-onboard/react';

export enum TransactionStatus {
  NONE = 'none',
  BUILT = 'built',
  ERROR_BUILDING = 'error-building',
  WAIT_USER_CONFIRM = 'wait-user-confirm',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  REVERT = 'revert',
  APPROVAL_PENDING = 'approval-pending',
}

function useSubmitTransaction() {
  const {
    globalState: { sentTransactions },
    updateNotional,
  } = useNotionalContext();
  const { userWallet } = useWalletStore();
  const { pathname } = useLocation();
  const [{ wallet }] = useConnectWallet();

  const submitTransaction = useCallback(
    async (
      transactionLabel: string,
      populatedTransaction: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (!wallet || !userWallet?.selectedChain)
        throw Error('provider undefined');

      const provider = new ethers.providers.Web3Provider(wallet?.provider);
      const signer = provider?.getSigner();

      if (!signer) throw Error('Signer undefined');

      const tx = await signer.sendTransaction(populatedTransaction);
      const { hash } = tx;
      trackEvent(TRACKING_EVENTS.SUBMIT_TXN, {
        url: pathname,
        txnHash: hash,
        transactionLabel,
        userWallet,
      });

      updateNotional({
        sentTransactions: [
          ...sentTransactions,
          { network: userWallet?.selectedChain, response: tx, tokens, hash },
        ],
      });

      return hash;
    },
    [updateNotional, sentTransactions, pathname, userWallet, wallet]
  );

  return {
    isReadOnlyAddress: userWallet?.isReadOnlyAddress,
    submitTransaction,
  };
}

function usePendingTransaction(hash?: string) {
  const {
    globalState: { completedTransactions },
  } = useNotionalContext();

  // Returns the completed transaction receipt
  const transactionReceipt = hash ? completedTransactions[hash] : undefined;

  return { transactionReceipt, reverted: transactionReceipt?.status === 0 };
}

export function usePendingPnLCalculation(network: Network | undefined) {
  const {
    globalState: { pendingPnL },
  } = useNotionalContext();

  return network ? pendingPnL[network] : [];
}

export function useTransactionStatus(
  network: Network | undefined,
  onTxnConfirmed?: () => void
) {
  const { userWallet } = useWalletStore();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const { transactionReceipt, reverted } =
    usePendingTransaction(transactionHash);
  const { isReadOnlyAddress, submitTransaction } = useSubmitTransaction();
  const { pathname } = useLocation();
  const isWalletConnectedToNetwork =
    !!network &&
    !!userWallet?.selectedAddress &&
    network === userWallet?.selectedChain;

  useEffect(() => {
    if (reverted) setTransactionHash(TransactionStatus.REVERT);
    else if (transactionReceipt) {
      setTransactionStatus(TransactionStatus.CONFIRMED);
      // if (network) refreshActiveAccount(network);
      if (onTxnConfirmed) onTxnConfirmed();
    }
  }, [transactionReceipt, reverted, network, onTxnConfirmed]);

  const onSubmit = useCallback(
    (
      transactionLabel: string,
      populatedTransaction?: PopulatedTransaction,
      expectedTokenChanges?: TokenDefinition[]
    ) => {
      if (!isWalletConnectedToNetwork) {
        console.error('Wallet does not match expected network');
        return;
      }

      if (populatedTransaction) {
        setTransactionStatus(TransactionStatus.WAIT_USER_CONFIRM);
        submitTransaction(
          transactionLabel,
          populatedTransaction,
          expectedTokenChanges
        )
          .then((hash) => {
            setTransactionStatus(TransactionStatus.SUBMITTED);
            setTransactionHash(hash);
          })
          .catch((e) => {
            logError(e, 'use-transaction', 'onSubmit');
            // If we see an error here it is most likely due to user rejection
            trackEvent(TRACKING_EVENTS.REJECT_TXN, {
              url: pathname,
              transactionLabel,
              selectedNetwork: network,
            });
            setTransactionStatus(TransactionStatus.NONE);
          });
      }
    },
    [submitTransaction, pathname, network, isWalletConnectedToNetwork]
  );

  return {
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
    onSubmit,
  };
}
