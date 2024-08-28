import { types, Instance } from 'mobx-state-tree';
import { Network } from '@notional-finance/util';
import { AccountState } from '../global';

const UserWalletModel = types.model('UserWalletModel', {
  selectedChain: types.maybe(types.enumeration('Network', Object.values(Network))),
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
    networkAccounts: types.maybe(types.map(types.frozen<AccountState>())),
    totalPoints: types.maybe(types.number),
  })
  .actions((self) => ({
    setUserWallet(userWallet: Instance<typeof UserWalletModel> | undefined) {
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
