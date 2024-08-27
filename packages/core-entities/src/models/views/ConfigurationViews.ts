import { Instance } from 'mobx-state-tree';
import { NetworkModel } from '../NetworkModel';

export const ConfigurationViews = (self: Instance<typeof NetworkModel>) => {
  const getConfig = (currencyId: number) => {
    return self.configuration?.currencyConfigurations.find(
      (c) => c.id === `${currencyId}`
    );
  };

  return {
    getConfig,
  };
};
