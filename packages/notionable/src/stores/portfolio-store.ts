import { Instance, types } from 'mobx-state-tree';
import { PointsStoreModel } from './points-store';
import {
  NotionalTypes,
  TokenDefinitionModel,
} from '@notional-finance/core-entities/src/models/ModelTypes';

const APYDataModel = types.model('APYData', {
  totalAPY: types.optional(types.number, 0),
  organicAPY: types.optional(types.number, 0),
  feeAPY: types.optional(types.number, 0),
  incentives: types.optional(
    types.array(
      types.model({
        symbol: types.string,
        incentiveAPY: types.optional(types.number, 0),
      })
    ),
    []
  ),
  utilization: types.optional(types.number, 0),
  leverageRatio: types.optional(types.number, 0),
  debtAPY: types.optional(types.number, 0),
});

const ProductDetailModel = types.model('ProductDetailModel', {
  token: types.reference(TokenDefinitionModel),
  apy: types.reference(APYDataModel),
  tvl: types.reference(NotionalTypes.TokenBalance),
  liquidity: types.reference(NotionalTypes.TokenBalance),
  underlying: types.maybe(types.reference(TokenDefinitionModel)),
  collateralFactor: types.optional(types.string, ''),
  debtToken: types.maybe(types.reference(TokenDefinitionModel)),
});

const ProductGroupModel = types.array(ProductDetailModel);

const StateZeroDataModel = types.model('StateZeroDataModel', {
  tokenList: types.array(types.string),
  productGroupData: types.array(ProductGroupModel),
  defaultSymbol: types.optional(types.string, 'ETH'),
});

export type ProductGroupModelType = Instance<typeof ProductGroupModel>;
export type StateZeroDataType = Instance<typeof StateZeroDataModel>;


export const PortfolioStoreModel = types
  .model('PortfolioStoreModel', {
    pointsStore: PointsStoreModel,
  })

export type PortfolioStoreType = Instance<typeof PortfolioStoreModel>;