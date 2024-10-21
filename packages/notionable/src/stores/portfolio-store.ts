import { getRoot, Instance, types } from 'mobx-state-tree';
import { PointsStoreModel } from './points-store';
import { RootStoreInterface, RootStoreType } from './root-store';
import { reaction, when } from 'mobx';
import {
  PRODUCTS,
  ROUTE_MATCH,
  SupportedNetworks,
  unique,
} from '@notional-finance/util';

export interface APYData {
  totalAPY?: number;
  organicAPY?: number;
  feeAPY?: number;
  incentives?: {
    symbol: string;
    incentiveAPY: number;
  }[];
  utilization?: number;
  pointMultiples?: Record<string, number>;
  leverageRatio?: number;
  debtAPY?: number;
}

function getMaturityAPYPerSymbol(
  data: Array<{ apy: { totalAPY?: number }; symbol: string }>
) {
  const symbolMap = new Map<
    string,
    { apy: { totalAPY?: number }; symbol: string }
  >();

  data.forEach((item) => {
    if (
      !symbolMap.has(item.symbol) ||
      (item.apy.totalAPY ?? -Infinity) >
        (symbolMap.get(item.symbol)?.apy.totalAPY ?? -Infinity)
    ) {
      symbolMap.set(item.symbol, item);
    }
  });

  return Array.from(symbolMap.values());
}

const getUniqueUnderlyingSymbols = (productGroupData: any[][]) => {
  const uniqueUnderlyingSymbols = productGroupData
    .flat()
    .map((item) => item?.symbol)
    .filter((symbol): symbol is string => symbol !== undefined);

  return unique(uniqueUnderlyingSymbols);
};

const getGreatestUniqueUnderlyingSymbols = (productGroupData: any[][]) => {
  const symbolAPYMap = new Map<string, number>();

  productGroupData.flat().forEach((item) => {
    if (item?.symbol && item?.apy?.totalAPY !== undefined) {
      const currentAPY = symbolAPYMap.get(item.symbol) || -Infinity;
      symbolAPYMap.set(item.symbol, Math.max(currentAPY, item.apy.totalAPY));
    }
  });

  return Array.from(symbolAPYMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([symbol]) => symbol);
};

const APYDataModel = types.model('APYData', {
  totalAPY: types.optional(types.maybe(types.number), undefined),
  organicAPY: types.optional(types.maybe(types.number), undefined),
  feeAPY: types.optional(types.maybe(types.number), undefined),
  incentives: types.optional(
    types.array(
      types.model({
        symbol: types.string,
        incentiveAPY: types.optional(types.number, 0),
      })
    ),
    []
  ),
  utilization: types.optional(types.maybe(types.number), undefined),
  leverageRatio: types.optional(types.maybe(types.number), undefined),
  debtAPY: types.optional(types.maybe(types.number), undefined),
});

const ItemModel = types.model('ItemModel', {
  apy: APYDataModel,
  symbol: types.string,
  debtTokenId: types.optional(types.string, ''),
  maxLeverageRatio: types.optional(types.number, 0),
  vaultAddress: types.optional(types.string, ''),
});

const StateZeroItemModel = types.array(types.array(ItemModel));

const StateZeroGroupModel = types.model('StateZeroGroupModel', {
  defaultSymbol: types.string,
  data: StateZeroItemModel,
  tokenList: types.array(types.string),
});

export type APYDataType = Instance<typeof APYDataModel>;
export type ItemType = Instance<typeof ItemModel>;
export type StateZeroItemType = Instance<typeof StateZeroItemModel>;
export type StateZeroDataType = Instance<typeof StateZeroGroupModel>;

export const PortfolioStoreModel = types
  .model('PortfolioStoreModel', {
    pointsStore: PointsStoreModel,
    stateZeroEarnData: StateZeroGroupModel,
    stateZeroBorrowData: StateZeroGroupModel,
    stateZeroLeveragedData: StateZeroGroupModel,
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
        const currencyId = model.getTokenBySymbol(underlyingSymbol)?.currencyId;
        if (!currencyId) return false;

        try {
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
  })
  .actions((self) => ({
    setStateZeroEarnData() {
      const root = getRoot<RootStoreType>(self);
      const clientNetwork = root.currentNetworkClient;
      if (!clientNetwork.isReady()) {
        return;
      }
      const getStateZeroEarnData = () => {
        const fCashLendData = clientNetwork.getAllFCashYields().map((t) => {
          return {
            apy: t.apy,
            symbol: t.underlying ? t.underlying.symbol : '',
          };
        });
        const nTokenData = clientNetwork.getAllNTokenYields().map((t) => {
          return {
            apy: t.apy,
            symbol: t.underlying ? t.underlying.symbol : '',
          };
        });
        const primeCashLendData = clientNetwork.getAllFCashYields().map((t) => {
          return {
            apy: t.apy,
            symbol: t.underlying ? t.underlying.symbol : '',
          };
        });

        const earnData = [
          primeCashLendData,
          getMaturityAPYPerSymbol(fCashLendData),
          nTokenData,
        ];
        const tokenList = getGreatestUniqueUnderlyingSymbols(earnData);
        const result = {
          defaultSymbol: tokenList[0],
          data: earnData,
          tokenList: tokenList,
        };
        return result;
      };

      const result = getStateZeroEarnData();
      self.stateZeroEarnData = result as any;
    },

    setStateZeroLeveragedData() {
      const root = getRoot<RootStoreType>(self);
      const clientNetwork = root.currentNetworkClient;
      if (!clientNetwork.isReady()) {
        return;
      }
      const getAllLeveragedNTokenYields = () => {
        const leveragedNTokenData = clientNetwork
          .getAllLeveragedNTokenYields()
          .map((t) => {
            return {
              vaultAddress: '',
              apy: t?.apy,
              maxLeverageRatio: t.maxLeverageRatio,
              symbol: t.underlying ? t.underlying.symbol : '',
              debtTokenId: t?.debtToken?.id,
            };
          });
        return leveragedNTokenData;
      };

      const getVaultsData = () => {
        const vaultsData = clientNetwork
          .getAllListedVaultsWithYield()
          .map((v) => {
            return {
              vaultAddress: v.vaultConfig.vaultAddress,
              apy: v.apy,
              maxLeverageRatio: v.maxLeverageRatio,
              symbol: v.underlying ? v.underlying.symbol : '',
              debtTokenId: v.debtToken?.id,
              vaultType: v.vaultConfig.vaultType,
            };
          });

        return {
          pointsVaults: vaultsData.filter(
            (v) => v.vaultType === 'SingleSidedLP_Points'
          ),
          farmingVaults: vaultsData.filter(
            (v) =>
              v.vaultType === 'SingleSidedLP_AutoReinvest' ||
              v.vaultType === 'SingleSidedLP_DirectClaim'
          ),
        };
      };

      const getStateZeroLeveragedData = () => {
        const { pointsVaults, farmingVaults } = getVaultsData();
        const leveragedNTokenData = getAllLeveragedNTokenYields();
        const leveragedGroupData = [
          leveragedNTokenData,
          pointsVaults,
          farmingVaults,
        ];
        const tokenList =
          getGreatestUniqueUnderlyingSymbols(leveragedGroupData);

        const result = {
          tokenList,
          data: leveragedGroupData,
          defaultSymbol: tokenList[0],
        };
        return result;
      };
      const result = getStateZeroLeveragedData();
      self.stateZeroLeveragedData = result as any;
    },

    setStateZeroBorrowData() {
      const root = getRoot<RootStoreType>(self);
      const clientNetwork = root.currentNetworkClient;
      if (!clientNetwork.isReady()) {
        return;
      }
      const getStateBorrowData = () => {
        const fCashBorrowData = clientNetwork.getAllFCashDebt().map((t) => {
          return {
            apy: t.apy,
            symbol: t.underlying ? t.underlying.symbol : '',
          };
        });
        const primeCashDebtData = clientNetwork.getAllFCashDebt().map((t) => {
          return {
            apy: t.apy,
            symbol: t.underlying ? t.underlying.symbol : '',
          };
        });
        const borrowData = [
          primeCashDebtData,
          getMaturityAPYPerSymbol(fCashBorrowData),
        ];
        const tokenList = getUniqueUnderlyingSymbols(borrowData);
        const result = {
          defaultSymbol: 'ETH',
          data: borrowData,
          tokenList: tokenList,
        };
        return result;
      };

      const result = getStateBorrowData();
      self.stateZeroBorrowData = result as any;
    },

    afterCreate() {
      const root = getRoot<RootStoreType>(self);
      reaction(
        () => root.network,
        () => {
          if (root.route === ROUTE_MATCH.PORTFOLIO_WELCOME) {
            when(
              () => root.currentNetworkClient.isReady(),
              () => {
                // @ts-ignore
                self.setStateZeroEarnData();
                // @ts-ignore
                self.setStateZeroLeveragedData();
                // @ts-ignore
                self.setStateZeroBorrowData();
              }
            );
          }
        }
      );
    },
  }));

export type PortfolioStoreType = Instance<typeof PortfolioStoreModel>;