import { types, Instance, getRoot } from 'mobx-state-tree';
import {
  NotionalTypes,
  TokenDefinition,
} from '@notional-finance/core-entities';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { RootStoreType } from './root-store';

const SentTransactionModel = types.model('SentTransactionModel', {
  hash: types.string,
  network: types.maybe(NotionalTypes.Network),
  response: types.frozen<TransactionResponse>(),
  tokens: types.maybe(types.array(types.frozen<TokenDefinition>())),
});

const PendingPnLModel = types.model('PendingPnLModel', {
  link: types.string,
  hash: types.string,
  blockNumber: types.number,
  tokens: types.array(types.frozen<TokenDefinition>()),
});

export const TransactionModel = types
  .model('TransactionModel', {
    sentTransactions: types.array(SentTransactionModel),
    completedTransactions: types.map(types.frozen<TransactionReceipt>()),
    pendingPnL: types.map(types.array(PendingPnLModel)),
  })
  .actions((self) => ({
    setSentTransaction(
      tx: TransactionResponse,
      tokens: TokenDefinition[] | undefined,
      hash: string
    ) {
      const root = getRoot<RootStoreType>(self);
      const walletStore = root.walletStore;

      self.sentTransactions.push({
        hash,
        network: walletStore.userWallet?.selectedChain,
        response: tx,
        tokens,
      });
    },
  }));

export type TransactionStoreType = Instance<typeof TransactionModel>;
