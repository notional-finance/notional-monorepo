import spindl from '@spindl-xyz/attribution';
import { types, Instance, flow, getRoot } from 'mobx-state-tree';
import {
  NotionalTypes,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  Network,
  SupportedNetworks,
  TRACKING_EVENTS,
  TransactionStatus,
} from '@notional-finance/util';
import { checkSanctionedAddress } from '../global/account/communities';
import { updateWalletTracking } from '../global/account/tracking';
import { identify, trackEvent } from '@notional-finance/helpers';
import {
  Provider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { AccountPortfolioModel } from './PortfolioModel';
import { RootStoreInterface } from './root-store';
import { ethers, PopulatedTransaction } from 'ethers';
import { WalletState } from '@web3-onboard/core';

const UserWalletModel = types.model('UserWalletModel', {
  selectedChain: types.maybe(NotionalTypes.Network),
  selectedAddress: types.string,
  isReadOnlyAddress: types.optional(types.boolean, false),
  label: types.maybe(types.string),
});

const SentTransactionModel = types.model('SentTransactionModel', {
  hash: types.string,
  network: types.enumeration(Object.values(Network)),
  response: types.frozen<TransactionResponse>(),
  tokens: types.maybe(types.array(types.frozen<TokenDefinition>())),
});

const TransactionReceiptModel = types.model('TransactionReceiptModel', {
  to: types.string,
  from: types.string,
  contractAddress: types.maybeNull(types.string),
  transactionIndex: types.number,
  root: types.maybe(types.string),
  gasUsed: NotionalTypes.BigNumber,
  logsBloom: types.string,
  blockHash: types.string,
  transactionHash: types.string,
  blockNumber: types.number,
  confirmations: types.number,
  cumulativeGasUsed: NotionalTypes.BigNumber,
  effectiveGasPrice: NotionalTypes.BigNumber,
  byzantium: types.boolean,
  type: types.number,
  status: types.maybe(types.number),
});

const PendingPnLModel = types.model('PendingPnLModel', {
  link: types.string,
  hash: types.string,
  blockNumber: types.number,
  tokens: types.array(types.frozen<TokenDefinition>()),
});

export const WalletModel = types
  .model('WalletModel', {
    userWallet: types.maybe(UserWalletModel),
    isSanctionedAddress: types.boolean,
    isAccountPending: types.boolean,
    networkAccounts: types.optional(types.map(AccountPortfolioModel), {}),
    totalPoints: types.maybe(types.number),
    sentTransactions: types.optional(types.array(SentTransactionModel), []),
    completedTransactions: types.optional(
      types.array(TransactionReceiptModel),
      []
    ),
    pendingPnL: types.optional(types.map(types.array(PendingPnLModel)), {}),
    transactionHash: types.maybe(types.string),
    transactionStatus: types.maybe(
      types.enumeration<TransactionStatus>(Object.values(TransactionStatus))
    ),
  })
  .views((self) => ({
    getAccountDefinition(network: Network) {
      return self.networkAccounts.get(network);
    },
  }))
  .actions((self) => {
    const root = getRoot<RootStoreInterface>(self);
    const executeUserTracking = async (
      userWallet: Instance<typeof UserWalletModel>
    ) => {
      // Set up account refresh on all supported networks
      // const tokenBalances = Object.fromEntries(
      //   await Promise.all(
      //     SupportedNetworks.map(async (n) => {
      //       await accounts.setAccount(n, selectedAddress);
      //       return [
      //         n,
      //         accounts
      //           .getAccount(n, selectedAddress)
      //           ?.balances.filter((t) => t.tokenType === 'Underlying')
      //           .map((t) => t.toDisplayStringWithSymbol(6)) || [],
      //       ];
      //     })
      //   )
      // );

      if (!userWallet.isReadOnlyAddress) {
        identify(
          userWallet.selectedAddress,
          userWallet.selectedChain,
          userWallet.label || 'unknown',
          JSON.stringify({})
        );
      }

      // check sanctioned address
      const isSanctionedAddress = await checkSanctionedAddress(
        userWallet.selectedAddress
      );

      const account = userWallet?.selectedChain
        ? root.getNetworkAccount(userWallet?.selectedChain)
        : undefined;

      await updateWalletTracking(
        userWallet.selectedAddress,
        userWallet.isReadOnlyAddress,
        account?.balances || []
      );

      if (!isSanctionedAddress) {
        spindl.attribute(userWallet.selectedAddress);
      }

      return isSanctionedAddress;
    };

    const setCompletedTransactions = (receipt: TransactionReceipt) => {
      if (receipt.transactionHash) {
        self.completedTransactions.push(
          TransactionReceiptModel.create(receipt)
        );
      }
    };

    const setSentTransactions = (
      sentTxns: {
        hash: string;
        network: Network;
        response: TransactionResponse;
        tokens: TokenDefinition[] | undefined;
      }[]
    ) => {
      self.sentTransactions.push(...sentTxns);
    };

    const setTransactionStatus = (status: TransactionStatus) => {
      self.transactionStatus = status;
    };

    const setTransactionHash = (hash: string) => {
      self.transactionHash = hash;
    };

    const refreshPortfolio = () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const account = self.userWallet?.selectedChain
            ? root.getNetworkAccount(self.userWallet?.selectedChain)
            : undefined;
          if (account) {
            account.refreshPortfolio();
          }
          resolve();
        }, 3000);
      });
    };

    const submitTxn = flow(function* (
      transactionLabel: string,
      populatedTransaction: PopulatedTransaction,
      wallet?: WalletState,
      onTxnConfirmed?: () => void,
      expectedTokenChanges?: TokenDefinition[]
    ) {
      if (!wallet || !self.userWallet?.selectedChain)
        throw Error('provider undefined');
      const provider = new ethers.providers.Web3Provider(wallet?.provider);
      const signer = provider?.getSigner();

      if (!signer) throw Error('Signer undefined');
      if (populatedTransaction) {
        setTransactionStatus(TransactionStatus.WAIT_USER_CONFIRM);
      }
      try {
        const tx = yield signer.sendTransaction(populatedTransaction);
        setTransactionStatus(TransactionStatus.SUBMITTED);
        trackEvent(TRACKING_EVENTS.SUBMIT_TXN, {
          url: window.location.pathname,
          transactionLabel,
          selectedNetwork: self.userWallet?.selectedChain,
        });
        const { hash } = tx;
        setTransactionHash(hash);

        setSentTransactions([
          {
            network: self.userWallet?.selectedChain,
            response: tx,
            tokens: expectedTokenChanges,
            hash,
          },
        ]);

        const receipt = yield provider.waitForTransaction(hash);
        // receipt status 1 is success
        if (receipt.status === 1) {
          setTransactionStatus(TransactionStatus.CONFIRMED);
          trackEvent(TRACKING_EVENTS.SUCCESSFUL_TXN, {
            url: window.location.pathname,
            transactionLabel,
            selectedNetwork: self.userWallet?.selectedChain,
          });
          if (onTxnConfirmed) onTxnConfirmed();
          yield refreshPortfolio();
        } else if (receipt.status === 0) {
          setTransactionStatus(TransactionStatus.REVERT);
          trackEvent(TRACKING_EVENTS.TXN_ERROR, {
            url: window.location.pathname,
            transactionLabel,
            selectedNetwork: self.userWallet?.selectedChain,
          });
        }
        setCompletedTransactions(receipt);
      } catch (error) {
        trackEvent(TRACKING_EVENTS.REJECT_TXN, {
          url: window.location.pathname,
          transactionLabel,
          selectedNetwork: self.userWallet?.selectedChain,
        });
        setTransactionStatus(TransactionStatus.NONE);
      }
    });

    const setUserWallet = flow(function* (
      userWallet: Instance<typeof UserWalletModel> | undefined,
      provider?: Provider
    ) {
      if (
        userWallet?.selectedAddress &&
        self.userWallet?.selectedAddress !== userWallet?.selectedAddress
      ) {
        self.isAccountPending = true;
        // Trigger account data fetch on wallet address change
        self.networkAccounts.clear();
        SupportedNetworks.forEach((network) => {
          const m = AccountPortfolioModel.create({
            address: userWallet.selectedAddress,
            network,
          });
          if (provider) m.setProvider(provider);
          self.networkAccounts.set(network, m);
        });
        self.isSanctionedAddress = yield executeUserTracking(userWallet);
        self.isAccountPending = false;
      }

      self.userWallet = userWallet;
    });

    return {
      submitTxn,
      refreshPortfolio,
      setUserWallet,
      setSentTransactions,
      setTransactionStatus,
      setTransactionHash,
      setCompletedTransactions,
    };
  })
  .views((self) => {
    const getLatestProcessedTxnBlock = () => {
      for (const n of SupportedNetworks) {
        const latestProcessedTxnBlock = Math.max(
          ...(self?.completedTransactions?.map(
            ({ blockNumber }) => blockNumber
          ) || [0])
        );

        self.pendingPnL[n] = self.pendingPnL[n]?.filter(
          ({ blockNumber }) => latestProcessedTxnBlock < blockNumber
        );
      }
      return { pendingPnL: self.pendingPnL };
    };

    return {
      getLatestProcessedTxnBlock,
    };
  });
