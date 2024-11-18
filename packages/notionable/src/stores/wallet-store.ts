import spindl from '@spindl-xyz/attribution';
import { types, Instance, flow, getRoot } from 'mobx-state-tree';
import {
  NotionalTypes,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { checkSanctionedAddress } from '../global/account/communities';
import { updateWalletTracking } from '../global/account/tracking';
import { identify } from '@notional-finance/helpers';
import { Provider, TransactionResponse } from '@ethersproject/providers';
import { AccountPortfolioModel } from './PortfolioModel';
import { RootStoreInterface } from './root-store';

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
  contractAddress: types.string,
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

const CompletedTransactionModel = types.map(TransactionReceiptModel);

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
    completedTransactions: types.optional(CompletedTransactionModel, {}),
    pendingPnL: types.optional(types.map(types.array(PendingPnLModel)), {}),
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
      setUserWallet,
      setSentTransactions,
    };
  });
