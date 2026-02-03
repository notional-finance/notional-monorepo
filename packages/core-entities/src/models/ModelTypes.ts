import { Network } from '@notional-finance/util';
import { types } from 'mobx-state-tree';
import { SerializedTokenBalance, TokenBalance } from '../token-balance';
import { BigNumber } from 'ethers';
import FixedPoint from '../exchanges/BalancerV2/fixed-point';
import { SystemAccount, TokenInterface, TokenType } from '../Definitions';

export interface TimeSeriesDataPoint {
  timestamp: number;
  [key: string]: number;
}

export const NotionalTypes = {
  Network: types.enumeration<Network>('Network', Object.values(Network)),
  TokenType: types.enumeration<TokenType>('TokenType', [
    'Underlying',
    'VaultShare',
    'VaultDebt',
    'Fiat',
  ]),
  TokenInterface: types.enumeration<TokenInterface>('TokenInterface', [
    'ERC20',
    'ERC1155',
    'FIAT',
  ]),
  SystemAccount: types.enumeration<SystemAccount>('SystemAccount', [
    'None',
    'ZeroAddress',
    'Vault',
    'NOTE',
  ]),
  BigNumber: types.custom<{ type: 'BigNumber'; hex: string }, BigNumber>({
    name: 'BigNumber',
    fromSnapshot(value) {
      return BigNumber.from(value.hex);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof BigNumber) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot === undefined) return 'snapshot is undefined';
      if (snapshot.type !== 'BigNumber') return 'not big number';
      if (snapshot.hex === undefined) return 'hex is required';
      return '';
    },
  }),
  FixedPoint: types.custom<ReturnType<FixedPoint['toJSON']>, FixedPoint>({
    name: 'FixedPoint',
    fromSnapshot(value) {
      return FixedPoint.fromJSON(value);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof FixedPoint) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot === undefined) return 'snapshot is undefined';
      if (snapshot._isFixedPoint === false) return 'not fixed point';
      if (snapshot._hex === undefined) return 'hex is required';
      return '';
    },
  }),
  TokenBalance: types.custom<SerializedTokenBalance, TokenBalance>({
    name: 'TokenBalance',
    fromSnapshot(value) {
      return TokenBalance.fromJSON(value);
    },
    toSnapshot(value) {
      return value.toJSON();
    },
    isTargetType(value): boolean {
      if (value instanceof TokenBalance) return true;
      return false;
    },
    getValidationMessage(snapshot) {
      if (snapshot === undefined) return 'snapshot is undefined';
      if (snapshot._isTokenBalance === false) return 'not token balance';
      if (snapshot.network === undefined) return 'network is required';
      if (snapshot.tokenId === undefined) return 'tokenId is required';
      if (snapshot.hex === undefined) return 'hex is required';
      return '';
    },
  }),
  TimeSeriesDataPoint: types.custom<TimeSeriesDataPoint, TimeSeriesDataPoint>({
    name: 'TimeSeriesDataPoint',
    fromSnapshot(snapshot) {
      Object.entries(snapshot).forEach(([key, value]) => {
        if (value === null) {
          // This is a workaround for the fact that the server returns null for some values
          snapshot[key] = 0;
        } else if (typeof value !== 'number') {
          throw new Error('All values must be numbers');
        }
      });
      return snapshot;
    },
    toSnapshot(value) {
      return value;
    },
    isTargetType(value) {
      return (
        typeof value === 'object' &&
        value !== null &&
        typeof value.timestamp === 'number' &&
        Object.values(value).every((v) => typeof v === 'number')
      );
    },
    getValidationMessage(value) {
      if (typeof value !== 'object' || value === null) {
        return 'Value must be an object';
      }
      if (
        !Object.values(value).every((v) => typeof v === 'number' || v === null)
      ) {
        return 'All values must be numbers';
      }
      return '';
    },
  }),
};

export const TokenDefinitionModel = types.model('TokenDefinition', {
  id: types.identifier,
  address: types.string,
  network: NotionalTypes.Network,
  name: types.string,
  symbol: types.string,
  decimals: types.number,
  tokenInterface: NotionalTypes.TokenInterface,
  tokenType: NotionalTypes.TokenType,
  totalSupply: types.maybe(NotionalTypes.TokenBalance),
  underlying: types.maybe(types.string),
  maturity: types.maybe(types.number),
  vaultAddress: types.maybe(types.string),
  isFCashDebt: types.maybe(types.boolean),
  currencyId: types.maybe(types.number),
});

export const LendingRouterModel = types.model('LendingRouter', {
  id: types.identifier,
  name: types.string,
  markets: types.array(
    types.model({
      vault: types.string,
      params: types.string,
    })
  ),
});

export const WithdrawRequestManagerModel = types.model(
  'WithdrawRequestManager',
  {
    id: types.identifier,
    yieldToken: types.reference(TokenDefinitionModel),
    withdrawToken: types.reference(TokenDefinitionModel),
    stakingToken: types.reference(TokenDefinitionModel),
  }
);

const ProjectModel = types.model('ProjectModel', {
  id: types.identifier,
  name: types.string,
  description: types.maybe(types.string),
  logoURL: types.maybe(types.string),
});

const RewardModel = types.model('RewardModel', {
  id: types.identifier,
  name: types.string,
  token: types.reference(TokenDefinitionModel),
});

const VaultAssetModel = types.model('VaultAssetModel', {
  id: types.identifier,
  name: types.string,
  contractAddress: types.string,
  logoURL: types.maybe(types.string),
  description: types.maybe(types.string),
});

export const VaultModel = types.model('VaultModel', {
  vaultAddress: types.identifier,
  vaultIcon: types.maybe(types.string),
  name: types.string,
  network: NotionalTypes.Network,
  vaultFeatures: types.array(types.string),
  launchedOn: types.Date,
  strategyClass: types.string,
  vaultDescription: types.string,
  isVisible: types.boolean,
  rewards: types.optional(types.array(RewardModel), []),
  projects: types.optional(types.array(ProjectModel), []),
  vaultAssets: types.optional(types.array(VaultAssetModel), []),
  depositToken: types.reference(TokenDefinitionModel),
  yieldToken: types.reference(TokenDefinitionModel),
  vaultToken: types.reference(TokenDefinitionModel),
  feeRate: NotionalTypes.BigNumber,
  withdrawRequestManagers: types.optional(
    types.array(types.reference(WithdrawRequestManagerModel)),
    []
  ),
});

export const ConfigurationModel = types.model('Configuration', {
  lendingRouters: types.array(LendingRouterModel),
  withdrawRequestManagers: types.array(WithdrawRequestManagerModel),
  vaults: types.array(VaultModel),
});

const PoolDataModel = types
  .model('PoolData', {
    balances: types.array(NotionalTypes.TokenBalance),
    totalSupply: NotionalTypes.TokenBalance,
    // NOTE: these need to be parsed inside each exchange type
    poolParams: types.string,
  })
  .preProcessSnapshot((snapshot) => ({
    ...snapshot,
    poolParams:
      typeof snapshot.poolParams === 'string'
        ? snapshot.poolParams
        : JSON.stringify(snapshot.poolParams),
  }));

export const ExchangeModel = types.model('Exchange', {
  address: types.identifier,
  PoolClass: types.string,
  latestPoolData: types.maybe(PoolDataModel),
  earliestBlock: types.maybe(types.number),
});

const ExchangeRateModel = types.model('ExchangeRate', {
  rate: types.maybe(NotionalTypes.BigNumber),
  timestamp: types.number,
  blockNumber: types.number,
});

export const OracleType = [
  'Chainlink',
  'VaultShareOracleRate',
  'VaultFeeAccrualRate',
  'BorrowShareOracleRate',
  'WithdrawTokenExchangeRate',
  'sNOTE',
  'VaultShareAPY',
  'sNOTEToETHExchangeRate',
  'sNOTEReinvestmentAPY',
] as const;
export type OracleType = (typeof OracleType)[number];

export const OracleDefinitionModel = types.model('OracleDefinition', {
  id: types.identifier,
  oracleAddress: types.string,
  network: NotionalTypes.Network,
  oracleType: types.enumeration('OracleType', OracleType),
  base: types.reference(TokenDefinitionModel),
  quote: types.reference(TokenDefinitionModel),
  decimals: types.number,
  latestRate: ExchangeRateModel,
  quoteCurrencyId: types.maybeNull(types.number),
  baseDecimals: types.maybeNull(types.number),
});

export const OracleGraphModel = types.model('OracleGraph', {
  adjList: types.optional(
    types.map(
      types.optional(
        types.map(
          types.model({
            oracle: types.reference(OracleDefinitionModel),
            inverted: types.boolean,
          })
        ),
        {}
      )
    ),
    {}
  ),
});

const BaseVaultDefinitionModel = types.model('BaseVaultDefinition', {
  vaultAddress: types.identifier,
  enabled: types.boolean,
  strategyType: types.string,
});

const SingleSidedLPVaultModel = BaseVaultDefinitionModel.props({
  pool: types.string,
  singleSidedTokenIndex: types.number,
  totalLPTokens: NotionalTypes.TokenBalance,
  totalVaultShares: NotionalTypes.BigNumber,
  maxPoolShares: NotionalTypes.BigNumber,
  totalPoolSupply: types.maybe(NotionalTypes.TokenBalance),
  rewardState: types.maybe(
    types.array(
      types.model({
        lastAccumulatedTime: types.number,
        endTime: types.number,
        rewardToken: types.string,
        emissionRatePerYear: NotionalTypes.BigNumber,
        accumulatedRewardPerVaultShare: NotionalTypes.BigNumber,
      })
    )
  ),
});

const PendlePTVaultModel = BaseVaultDefinitionModel.props({
  marketAddress: types.string,
  tokenInSy: types.string,
  tokenOutSy: types.string,
});

const StakingVaultModel = BaseVaultDefinitionModel.props({
  yieldToken: types.string,
});

export const VaultDefinitionModel = types.union(
  SingleSidedLPVaultModel,
  PendlePTVaultModel,
  StakingVaultModel
);

export const TimeSeriesModel = types.model('TimeSeriesModel', {
  id: types.identifier,
  data: types.array(NotionalTypes.TimeSeriesDataPoint),
  legend: types.array(
    types.model({
      series: types.string,
      format: types.enumeration('format', ['number', 'percent']),
      decimals: types.maybe(types.number),
    })
  ),
});

export const PriceChangeModel = types.model('PriceChange', {
  pastDate: types.number,
  pastFiat: NotionalTypes.TokenBalance,
  pastUnderlying: types.maybe(types.number),
});

const DateType = types.custom<string, Date>({
  name: 'Date',
  fromSnapshot(value: string) {
    return new Date(value);
  },
  toSnapshot(value: Date) {
    return value.toISOString();
  },
  isTargetType(value: unknown): value is Date {
    return value instanceof Date;
  },
  getValidationMessage(snapshot: string) {
    if (isNaN(Date.parse(snapshot))) {
      return 'Invalid date format';
    }
    return '';
  },
});

export const AnalyticsModel = types.model('Analytics', {
  noteSupply: types.maybe(
    types.array(
      types.model({
        address: types.union(
          types.literal('Burned'),
          types.literal('Circulating Supply'),
          types.literal('Non-Circulating')
        ),
        balance: types.number,
        day: DateType, // Changed from types.string to DateType
      })
    )
  ),
  sNOTEData: types.maybe(
    types.array(
      types.model({
        day: DateType, // Changed from types.string to DateType
        total_pool_value: types.maybeNull(types.number),
        snote_supply: types.maybeNull(types.number),
        price: types.maybeNull(types.number),
        apy: types.maybeNull(types.number),
      })
    )
  ),
  sNOTEReinvestment: types.maybe(
    types.array(
      types.model({
        day: types.string,
        evt_block_time: types.string,
        bpts_per_snote: types.number,
        eth_reinvestment: types.number,
        note_reinvestment: types.number,
        transaction_hash: types.string,
        apy: types.maybeNull(types.number),
      })
    )
  ),
  pointPrices: types.maybe(
    types.array(
      types.model({
        points: types.string,
        price: types.number,
      })
    )
  ),
  historicalTrading: types.maybe(
    types.map(
      types.array(
        types.model({
          bundleName: types.string,
          currencyId: types.number,
          fCashId: types.maybe(types.string),
          fCashValue: types.maybe(types.string),
          valueInUnderlying: types.string,
          timestamp: types.number,
          blockNumber: types.number,
          transactionHash: types.string,
          fCashMaturity: types.maybe(types.number),
        })
      )
    )
  ),
  vaultReinvestment: types.maybe(
    types.map(
      types.array(
        types.model({
          vault: types.string,
          blockNumber: types.number,
          timestamp: types.number,
          transactionHash: types.string,
          rewardAmountSold: NotionalTypes.TokenBalance,
          tokensReinvested: NotionalTypes.BigNumber,
          tokensPerVaultShare: NotionalTypes.BigNumber,
          underlyingAmountRealized: NotionalTypes.BigNumber,
          vaultSharePrice: NotionalTypes.BigNumber,
        })
      )
    )
  ),
  vaultAccountRisk: types.maybe(
    types.array(
      types.model({
        account: types.string,
        vaultAddress: types.string,
        vaultName: types.string,
        riskFactors: types.model({
          netWorth: NotionalTypes.TokenBalance,
          debts: NotionalTypes.TokenBalance,
          assets: NotionalTypes.TokenBalance,
          collateralRatio: types.union(types.number, types.null),
          healthFactor: types.union(types.number, types.null),
          aboveMaxLeverageRatio: types.boolean,
          leverageRatio: types.union(types.number, types.null),
        }),
      })
    )
  ),
  accountPortfolioRisk: types.maybe(
    types.array(
      types.model({
        address: types.string,
        hasCrossCurrencyRisk: types.boolean,
        riskFactors: types.model({
          netWorth: NotionalTypes.TokenBalance,
          freeCollateral: NotionalTypes.TokenBalance,
          loanToValue: types.number,
          healthFactor: types.union(types.number, types.null),
        }),
      })
    )
  ),
  priceChanges: types.maybe(
    types.map(
      types.model({
        oneDay: types.maybe(PriceChangeModel),
        threeDay: types.maybe(PriceChangeModel),
        sevenDay: types.maybe(PriceChangeModel),
      })
    )
  ),
});

export interface TimeSeriesLegend {
  series: string;
  format: 'number' | 'percent';
  decimals?: number;
}

export interface TimeSeriesResponse {
  id: string;
  data: TimeSeriesDataPoint[];
  legend: TimeSeriesLegend[];
}

export enum ChartType {
  APY = 'apy',
  PRICE = 'price',
}
