import { getRoot, Instance, types } from 'mobx-state-tree';
import { RootStoreInterface } from './root-store';
import { PRODUCTS, SupportedNetworks } from '@notional-finance/util';
import { NotionalTypes } from '@notional-finance/core-entities';

export const PortfolioStoreModel = types
  .model('PortfolioStoreModel', {
    network: NotionalTypes.Network,
  })
  .views((self) => {
    const getNetworksForProduct = (
      product: PRODUCTS,
      underlyingSymbol: string | undefined
    ) => {
      const root = getRoot<RootStoreInterface>(self);

      return SupportedNetworks.filter((n) => {
        const model = root.getNetworkClient(n);
        if (!underlyingSymbol) return false;

        try {
          const currencyId =
            model.getTokenBySymbol(underlyingSymbol)?.currencyId;
          if (!currencyId) return false;
          // NOTE: these getters throw errors if the token is not found so we catch
          // and return false
          if (
            product === PRODUCTS.LEND_FIXED ||
            product === PRODUCTS.LEND_LEVERAGED ||
            product === PRODUCTS.BORROW_FIXED ||
            product === PRODUCTS.LIQUIDITY_LEVERAGED ||
            product === PRODUCTS.LIQUIDITY_VARIABLE
          ) {
            return !!model.getNToken(currencyId);
          } else if (product === PRODUCTS.BORROW_VARIABLE) {
            return !!model.getPrimeDebt(currencyId);
          } else if (product === PRODUCTS.LEND_VARIABLE) {
            return !!model.getPrimeCash(currencyId);
          } else {
            return false;
          }
        } catch {
          return false;
        }
      });
    };

    return {
      getNetworksForProduct,
    };
  });

export type PortfolioStoreType = Instance<typeof PortfolioStoreModel>;
