import { types, Instance } from 'mobx-state-tree';
import { AccountModel, NotionalTypes } from '@notional-finance/core-entities';
import { SupportedNetworks } from '@notional-finance/util';

const UserWalletModel = types.model('UserWalletModel', {
  selectedChain: types.maybe(NotionalTypes.Network),
  selectedAddress: types.string,
  isReadOnlyAddress: types.optional(types.boolean, false),
  label: types.maybe(types.string),
});

export const WalletModel = types
  .model('WalletModel', {
    userWallet: types.maybe(UserWalletModel),
    communityMembership: types.optional(types.array(types.string), []),
    isSanctionedAddress: types.boolean,
    isAccountPending: types.boolean,
    networkAccounts: types.optional(types.map(AccountModel), {}),
    totalPoints: types.maybe(types.number),
  })
  .actions((self) => ({
    setUserWallet(userWallet: Instance<typeof UserWalletModel> | undefined) {
      if (
        userWallet?.selectedAddress &&
        self.userWallet?.selectedAddress !== userWallet?.selectedAddress
      ) {
        // Trigger account data fetch on wallet address change
        self.networkAccounts.clear();
        SupportedNetworks.forEach((network) => {
          const m = AccountModel.create({
            address: userWallet.selectedAddress,
            network,
          });
          // TODO: allow provider override here...
          self.networkAccounts.set(network, m);
        });
      }

      self.userWallet = userWallet;
    },
    setCommunityMembership(membership: string[]) {
      self.communityMembership.replace(membership);
    },
    setIsSanctionedAddress(isSanctioned: boolean) {
      self.isSanctionedAddress = isSanctioned;
    },
    setIsAccountPending(isPending: boolean) {
      self.isAccountPending = isPending;
    },
    setTotalPoints(points: number | undefined) {
      self.totalPoints = points;
    },
  }));

export type WalletStoreType = Instance<typeof WalletModel>;
