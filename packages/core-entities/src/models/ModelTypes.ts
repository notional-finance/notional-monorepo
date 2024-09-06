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
    'nToken',
    'WrappedfCash',
    'PrimeCash',
    'PrimeDebt',
    'fCash',
    'VaultShare',
    'VaultDebt',
    'VaultCash',
    'NOTE',
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
    'FeeReserve',
    'SettlementReserve',
    'Vault',
    'nToken',
    'PrimeCash',
    'PrimeDebt',
    'Notional',
    'NOTE',
    'SecondaryIncentiveRewarder',
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
      if (typeof snapshot.timestamp !== 'number') {
        throw new Error('Timestamp must be a number');
      }
      Object.values(snapshot).forEach((value) => {
        if (typeof value !== 'number') {
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
      if (typeof value.timestamp !== 'number') {
        return 'Timestamp must be a number';
      }
      if (!Object.values(value).every((v) => typeof v === 'number')) {
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

const InterestRateCurveModel = types.model('InterestRateCurve', {
  kinkUtilization1: types.number,
  kinkUtilization2: types.number,
  kinkRate1: types.number,
  kinkRate2: types.number,
  maxRate: types.number,
  minFeeRate: types.number,
  maxFeeRate: types.number,
  feeRatePercent: types.number,
});

const IncentiveModel = types.model('Incentive', {
  incentiveEmissionRate: types.maybeNull(types.string),
  accumulatedNOTEPerNToken: types.maybeNull(types.string),
  lastAccumulatedTime: types.maybeNull(types.string),
  currentSecondaryReward: types.maybeNull(
    types.model({
      id: types.string,
      symbol: types.string,
    })
  ),
  secondaryIncentiveRewarder: types.maybeNull(types.string),
  secondaryEmissionRate: types.maybeNull(types.string),
  accumulatedSecondaryRewardPerNToken: types.maybeNull(types.string),
  lastSecondaryAccumulatedTime: types.maybeNull(types.string),
  secondaryRewardEndTime: types.maybeNull(types.string),
});

const CurrencyConfigurationModel = types.model('CurrencyConfiguration', {
  id: types.identifier,
  underlying: types.model({ id: types.string }),
  pCash: types.model({ id: types.string }),
  pDebt: types.model({ id: types.string }),
  maxUnderlyingSupply: types.string,
  collateralHaircut: types.number,
  debtBuffer: types.number,
  liquidationDiscount: types.number,
  primeCashRateOracleTimeWindowSeconds: types.number,
  primeCashHoldingsOracle: types.string,
  primeCashCurve: InterestRateCurveModel,
  primeDebtAllowed: types.boolean,
  fCashRateOracleTimeWindowSeconds: types.maybeNull(types.number),
  fCashReserveFeeSharePercent: types.maybeNull(types.number),
  fCashDebtBufferBasisPoints: types.maybeNull(types.number),
  fCashHaircutBasisPoints: types.maybeNull(types.number),
  fCashMinOracleRate: types.maybeNull(types.number),
  fCashMaxOracleRate: types.maybeNull(types.number),
  fCashMaxDiscountFactor: types.maybeNull(types.number),
  fCashLiquidationHaircutBasisPoints: types.maybeNull(types.number),
  fCashLiquidationDebtBufferBasisPoints: types.maybeNull(types.number),
  fCashActiveCurves: types.maybeNull(types.array(InterestRateCurveModel)),
  fCashNextCurves: types.maybeNull(types.array(InterestRateCurveModel)),
  treasuryReserveBuffer: types.maybeNull(types.string),
  depositShares: types.maybeNull(types.array(types.number)),
  leverageThresholds: types.maybeNull(types.array(types.number)),
  proportions: types.maybeNull(types.array(types.number)),
  residualPurchaseIncentiveBasisPoints: types.maybeNull(types.number),
  residualPurchaseTimeBufferSeconds: types.maybeNull(types.number),
  cashWithholdingBufferBasisPoints: types.maybeNull(types.number),
  pvHaircutPercentage: types.maybeNull(types.number),
  liquidationHaircutPercentage: types.maybeNull(types.number),
  maxMintDeviationBasisPoints: types.maybeNull(types.number),
  incentives: types.maybeNull(IncentiveModel),
});

const VaultConfigurationModel = types.model('VaultConfiguration', {
  id: types.identifier,
  vaultAddress: types.string,
  strategy: types.string,
  primaryBorrowCurrency: types.model({
    id: types.string,
  }),
  minAccountBorrowSize: types.string,
  minCollateralRatioBasisPoints: types.number,
  maxDeleverageCollateralRatioBasisPoints: types.number,
  feeRateBasisPoints: types.number,
  reserveFeeSharePercent: types.number,
  liquidationRatePercent: types.number,
  maxBorrowMarketIndex: types.number,
  secondaryBorrowCurrencies: types.maybeNull(
    types.array(
      types.model({
        id: types.string,
      })
    )
  ),
  maxRequiredAccountCollateralRatioBasisPoints: types.number,
  enabled: types.boolean,
  allowRollPosition: types.boolean,
  onlyVaultEntry: types.boolean,
  onlyVaultExit: types.boolean,
  onlyVaultRoll: types.boolean,
  onlyVaultDeleverage: types.boolean,
  onlyVaultSettle: types.boolean,
  discountfCash: types.boolean,
  allowsReentrancy: types.boolean,
  deleverageDisabled: types.boolean,
  maxPrimaryBorrowCapacity: types.string,
  totalUsedPrimaryBorrowCapacity: types.string,
  maxSecondaryBorrowCapacity: types.maybeNull(types.string),
  totalUsedSecondaryBorrowCapacity: types.maybeNull(types.string),
  minAccountSecondaryBorrow: types.maybeNull(types.string),
});

const WhitelistedContractModel = types.model('WhitelistedContract', {
  id: types.identifier,
  name: types.string,
  capability: types.array(
    types.enumeration('WhitelistedCapability', [
      'GlobalTransferOperator',
      'AuthorizedCallbackContract',
      'SecondaryIncentiveRewarder',
      'DetachedSecondaryIncentiveRewarder',
    ])
  ),
});

export const ConfigurationModel = types.model('Configuration', {
  currencyConfigurations: types.array(CurrencyConfigurationModel),
  vaultConfigurations: types.array(VaultConfigurationModel),
  whitelistedContracts: types.array(WhitelistedContractModel),
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
  'fCashOracleRate',
  'fCashSettlementRate',
  'fCashToUnderlyingExchangeRate',
  'fCashSpotRate',
  'PrimeCashToUnderlyingOracleInterestRate',
  'PrimeCashPremiumInterestRate',
  'PrimeDebtPremiumInterestRate',
  'PrimeCashExternalLendingInterestRate',
  'PrimeCashToUnderlyingExchangeRate',
  'PrimeCashToMoneyMarketExchangeRate',
  'PrimeDebtToUnderlyingExchangeRate',
  'PrimeDebtToMoneyMarketExchangeRate',
  'MoneyMarketToUnderlyingExchangeRate',
  'VaultShareOracleRate',
  'nTokenToUnderlyingExchangeRate',
  'nTokenBlendedInterestRate',
  'nTokenFeeRate',
  'nTokenIncentiveRate',
  'nTokenSecondaryIncentiveRate',
  'sNOTE',
  'VaultShareAPY',
  'nTokenTotalAPY',
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

export const VaultDefinitionModel = types.model('VaultDefinition', {
  vaultAddress: types.identifier,
  enabled: types.boolean,
  name: types.string,
  technicalName: types.maybe(types.string),
  boosterProtocol: types.maybe(types.string),
  poolName: types.maybe(types.string),
  baseProtocol: types.maybe(types.string),
  // NOTE: these are just single sided lp vaults
  pool: types.string,
  singleSidedTokenIndex: types.number,
  totalLPTokens: NotionalTypes.TokenBalance,
  totalVaultShares: NotionalTypes.BigNumber,
  secondaryTradeParams: types.string,
});

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
