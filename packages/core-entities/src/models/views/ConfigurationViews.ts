import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';

export function assertDefined<T>(v: T | null | undefined): T {
  if (v === undefined || v === null) throw Error(`Undefined Value`);
  return v as T;
}

export const ConfigurationViews = (self: Instance<typeof NetworkModel>) => {
  const getLendingRouters = () => {
    return self.configuration?.lendingRouters;
  };

  const getWithdrawRequestManagers = () => {
    return self.configuration?.withdrawRequestManagers;
  };

  return {
    getLendingRouters,
    getWithdrawRequestManagers,
  };
};
