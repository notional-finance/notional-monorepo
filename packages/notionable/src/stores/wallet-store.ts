import spindl from '@spindl-xyz/attribution';
import { types, Instance, flow } from 'mobx-state-tree';
import { NotionalTypes } from '@notional-finance/core-entities';
import { SupportedNetworks } from '@notional-finance/util';
import { checkSanctionedAddress } from '../global/account/communities';
import { identify } from '@notional-finance/helpers';
import { Provider } from '@ethersproject/providers';
import { AccountPortfolioModel } from './PortfolioModel';

const UserWalletModel = types.model('UserWalletModel', {
  selectedChain: types.maybe(NotionalTypes.Network),
  selectedAddress: types.string,
  isReadOnlyAddress: types.optional(types.boolean, false),
  label: types.maybe(types.string),
});

export const WalletModel = types
  .model('WalletModel', {
    userWallet: types.maybe(UserWalletModel),
    isSanctionedAddress: types.boolean,
    isAccountPending: types.boolean,
    networkAccounts: types.optional(types.map(AccountPortfolioModel), {}),
    totalPoints: types.maybe(types.number),
  })
  .actions((self) => {
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

      if (!isSanctionedAddress) {
        spindl.attribute(userWallet.selectedAddress);
      }

      return isSanctionedAddress;
    };

    const setUserWallet = flow(function* (
      userWallet: Instance<typeof UserWalletModel> | undefined,
      provider?: Provider
    ) {
      if (
        userWallet?.selectedAddress &&
        self.userWallet?.selectedAddress !== userWallet?.selectedAddress
      ) {
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
      }

      self.userWallet = userWallet;
    });

    return {
      setUserWallet,
    };
  });

export type WalletStoreType = Instance<typeof WalletModel>;
