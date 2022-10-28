import { BigNumber, Contract, ethers, providers } from 'ethers';
import { Contracts } from '../../libs/types';
import TypedBigNumber, { BigNumberType } from '../../libs/TypedBigNumber';
import { aggregate, AggregateCall } from '../Multicall';
import { CurrencyConfig } from './Subgraph';
import { convertAssetType } from '../../libs/utils';
import { CashGroup } from '../../system';
import {
  AssetRateAggregator,
  BalancerPool,
  BalancerVault,
  IAggregator,
  Notional,
  SNOTE,
  IAggregatorABI,
  AssetRateAggregatorABI,
} from '@notional-finance/contracts';

const keyAppendId = (key: string) => (id: number | string) => `${key}_${id}`;

export const ConfigKeys = {
  sNOTE: {
    POOL_ID: 'sNOTE_POOL_ID',
    POOL_TOTAL_SUPPLY: 'sNOTE_POOL_TOTAL_SUPPLY',
    POOL_SWAP_FEE: 'sNOTE_POOL_SWAP_FEE',
    COOL_DOWN_TIME_SECS: 'sNOTE_COOL_DOWN_TIME_SECS',
    REDEEM_WINDOW_SECONDS: 'sNOTE_REDEEM_WINDOW_SECONDS',
    TOTAL_SUPPLY: 'sNOTE_TOTAL_SUPPLY',
    NOTE_INDEX: 'sNOTE_NOTE_INDEX',
    POOL_TOKEN_SHARE: 'sNOTE_POOL_TOKEN_SHARE',
    POOL_TOKEN_BALANCES: 'sNOTE_POOL_TOKEN_BALANCES',
    NOTE_ETH_ORACLE_PRICE: 'sNOTE_ETH_ORACLE_PRICE',
  },
  ETH_EXCHANGE_RATE: keyAppendId('ETH_EXCHANGE_RATE'),
  ASSET_EXCHANGE_RATE: keyAppendId('ASSET_EXCHANGE_RATE'),
  ASSET_ANNUAL_SUPPLY_RATE: keyAppendId('ASSET_ANNUAL_SUPPLY_RATE'),
  NTOKEN_PRESENT_VALUE: keyAppendId('NTOKEN_PRESENT_VALUE'),
  NTOKEN_ACCOUNT: keyAppendId('NTOKEN_ACCOUNT'),
  NTOKEN_PORTFOLIO: keyAppendId('NTOKEN_PORTFOLIO'),
  MARKETS: keyAppendId('MARKETS'),
};

const sNOTECalls = (
  balancerPool: BalancerPool,
  sNOTE: SNOTE,
  balancerVault: BalancerVault
): AggregateCall[] => [
  {
    target: balancerPool,
    method: 'getPoolId',
    args: [],
    key: ConfigKeys.sNOTE.POOL_ID,
    stage: 0,
  },
  {
    target: balancerPool,
    method: 'totalSupply',
    args: [],
    key: ConfigKeys.sNOTE.POOL_TOTAL_SUPPLY,
    stage: 0,
  },
  {
    target: balancerPool,
    method: 'getSwapFeePercentage',
    args: [],
    key: ConfigKeys.sNOTE.POOL_SWAP_FEE,
    stage: 0,
  },
  {
    target: sNOTE,
    method: 'coolDownTimeInSeconds',
    args: [],
    key: ConfigKeys.sNOTE.COOL_DOWN_TIME_SECS,
    stage: 0,
  },
  {
    target: sNOTE,
    method: 'REDEEM_WINDOW_SECONDS',
    args: [],
    key: ConfigKeys.sNOTE.REDEEM_WINDOW_SECONDS,
    stage: 0,
  },
  {
    target: sNOTE,
    method: 'NOTE_INDEX',
    args: [],
    key: ConfigKeys.sNOTE.NOTE_INDEX,
    stage: 0,
  },
  {
    target: sNOTE,
    method: 'totalSupply',
    args: [],
    key: ConfigKeys.sNOTE.TOTAL_SUPPLY,
    transform: (r: Awaited<ReturnType<typeof sNOTE.totalSupply>>) =>
      TypedBigNumber.encodeJSON(r, BigNumberType.sNOTE, 'sNOTE'),
    stage: 0,
  },
  {
    target: balancerPool,
    method: 'getTimeWeightedAverage',
    args: [[[0, 21600, 0]]], // Get average pair price from 1800 seconds ago
    key: ConfigKeys.sNOTE.NOTE_ETH_ORACLE_PRICE,
    transform: (
      r: Awaited<ReturnType<typeof balancerPool.getTimeWeightedAverage>>
    ) => r[0],
    stage: 0,
  },
  {
    target: sNOTE,
    method: 'getPoolTokenShare',
    args: (results) => [results[ConfigKeys.sNOTE.TOTAL_SUPPLY].hex],
    key: ConfigKeys.sNOTE.POOL_TOKEN_SHARE,
    stage: 1,
  },
  {
    target: balancerVault,
    method: 'getPoolTokens',
    args: (results) => [results[ConfigKeys.sNOTE.POOL_ID]],
    key: ConfigKeys.sNOTE.POOL_TOKEN_BALANCES,
    transform: (
      r: Awaited<ReturnType<typeof balancerVault.getPoolTokens>>,
      results: Record<string, any>
    ) => {
      const noteIndex = results[ConfigKeys.sNOTE.NOTE_INDEX];
      const ethIndex = 1 - noteIndex;
      return {
        ethBalance: TypedBigNumber.encodeJSON(
          r.balances[ethIndex],
          BigNumberType.ExternalUnderlying,
          'ETH'
        ),
        noteBalance: TypedBigNumber.encodeJSON(
          r.balances[noteIndex],
          BigNumberType.NOTE,
          'NOTE'
        ),
      };
    },
    stage: 1,
  },
];

const perCurrencyCalls = (
  currency: {
    id: number;
    assetSymbol: string;
    underlyingSymbol?: string;
    nTokenSymbol?: string;
    nTokenAddress?: string;
  },
  ethRate: {
    oracle: IAggregator;
    mustInvert: boolean;
    rateDecimalPlaces: number;
  },
  assetRateAdapter: AssetRateAggregator,
  notionalProxy: Notional,
  hasMarkets: boolean
): AggregateCall[] => {
  const calls: AggregateCall[] = [];
  if (ethRate.oracle.address !== ethers.constants.AddressZero) {
    calls.push({
      target: ethRate.oracle,
      method: 'latestAnswer',
      args: [],
      key: ConfigKeys.ETH_EXCHANGE_RATE(currency.id),
      transform: (
        r: Awaited<ReturnType<typeof ethRate.oracle.latestAnswer>>
      ) => {
        if (ethRate.mustInvert) {
          const rateDecimals = BigNumber.from(10).pow(
            ethRate.rateDecimalPlaces
          );
          return rateDecimals.mul(rateDecimals).div(r);
        }
        return r;
      },
    });
  }

  if (assetRateAdapter.address !== ethers.constants.AddressZero) {
    calls.push(
      {
        target: assetRateAdapter,
        method: 'getExchangeRateStateful',
        args: [],
        key: ConfigKeys.ASSET_EXCHANGE_RATE(currency.id),
      },
      {
        target: assetRateAdapter,
        method: 'getAnnualizedSupplyRate',
        args: [],
        key: ConfigKeys.ASSET_ANNUAL_SUPPLY_RATE(currency.id),
      }
    );
  }

  if (hasMarkets) {
    calls.push(
      {
        target: notionalProxy,
        method: 'nTokenPresentValueAssetDenominated',
        args: [currency.id],
        key: ConfigKeys.NTOKEN_PRESENT_VALUE(currency.id),
        transform: (
          r: Awaited<
            ReturnType<typeof notionalProxy.nTokenPresentValueAssetDenominated>
          >
        ) =>
          TypedBigNumber.encodeJSON(
            r,
            BigNumberType.InternalAsset,
            currency.assetSymbol
          ),
      },
      {
        target: notionalProxy,
        method: 'getNTokenAccount',
        args: [currency.nTokenAddress],
        key: ConfigKeys.NTOKEN_ACCOUNT(currency.id),
        transform: (
          r: Awaited<ReturnType<typeof notionalProxy.getNTokenAccount>>
        ) => ({
          totalSupply: TypedBigNumber.encodeJSON(
            r.totalSupply,
            BigNumberType.nToken,
            currency.nTokenSymbol!
          ),
          cashBalance: TypedBigNumber.encodeJSON(
            r.cashBalance,
            BigNumberType.InternalAsset,
            currency.assetSymbol
          ),
          accumulatedNOTEPerNToken: r.accumulatedNOTEPerNToken,
          lastAccumulatedTime: r.lastAccumulatedTime,
        }),
      },
      {
        target: notionalProxy,
        method: 'getNTokenPortfolio',
        args: [currency.nTokenAddress],
        key: ConfigKeys.NTOKEN_PORTFOLIO(currency.id),
        transform: (
          r: Awaited<ReturnType<typeof notionalProxy.getNTokenPortfolio>>
        ) => ({
          liquidityTokens: r.liquidityTokens.map((l) => ({
            currencyId: l.currencyId.toNumber(),
            maturity: l.maturity.toNumber(),
            assetType: convertAssetType(l.assetType),
            notional: TypedBigNumber.encodeJSON(
              l.notional,
              BigNumberType.LiquidityToken,
              currency.assetSymbol
            ),
            settlementDate: CashGroup.getSettlementDate(
              convertAssetType(l.assetType),
              l.maturity.toNumber()
            ),
          })),
          fCash: r.netfCashAssets.map((f) => ({
            currencyId: f.currencyId.toNumber(),
            maturity: f.maturity.toNumber(),
            assetType: convertAssetType(f.assetType),
            notional: TypedBigNumber.encodeJSON(
              f.notional,
              BigNumberType.InternalUnderlying,
              currency.underlyingSymbol!
            ),
            settlementDate: CashGroup.getSettlementDate(
              convertAssetType(f.assetType),
              f.maturity.toNumber()
            ),
          })),
        }),
      },
      {
        target: notionalProxy,
        method: 'getActiveMarkets',
        args: [currency.id],
        key: ConfigKeys.MARKETS(currency.id),
        transform: (
          r: Awaited<ReturnType<typeof notionalProxy.getActiveMarkets>>
        ) =>
          r.map((m) => ({
            totalfCash: TypedBigNumber.encodeJSON(
              m.totalfCash.toHexString(),
              BigNumberType.InternalUnderlying,
              currency.underlyingSymbol!
            ),
            totalAssetCash: TypedBigNumber.encodeJSON(
              m.totalAssetCash.toHexString(),
              BigNumberType.InternalAsset,
              currency.assetSymbol
            ),
            totalLiquidity: TypedBigNumber.encodeJSON(
              m.totalLiquidity.toHexString(),
              BigNumberType.LiquidityToken,
              currency.assetSymbol
            ),
            lastImpliedRate: m.lastImpliedRate.toNumber(),
            oracleRate: m.oracleRate.toNumber(),
            previousTradeTime: m.previousTradeTime.toNumber(),
          })),
      }
    );
  }

  return calls;
};

export async function getBlockchainData(
  provider: providers.Provider,
  contracts: Contracts,
  config: CurrencyConfig[]
) {
  const _sNOTECalls = sNOTECalls(
    contracts.balancerPool,
    contracts.sNOTE,
    contracts.balancerVault
  );
  const currencyCalls = config.flatMap((c) => {
    const rateAdapter = new Contract(
      c.assetExchangeRate?.rateAdapter._address || ethers.constants.AddressZero,
      AssetRateAggregatorABI,
      provider
    ) as AssetRateAggregator;

    return perCurrencyCalls(
      {
        id: c.id,
        assetSymbol: c.assetSymbol,
        underlyingSymbol: c.underlyingSymbol,
        nTokenSymbol: c.nToken?.nTokenSymbol,
        nTokenAddress: c.nToken?.contract._address,
      },
      {
        oracle: new Contract(
          c.ethExchangeRate.rateOracle._address!,
          IAggregatorABI,
          provider
        ) as IAggregator,
        mustInvert: c.ethExchangeRate.mustInvert,
        rateDecimalPlaces: c.ethExchangeRate.rateDecimalPlaces,
      },
      rateAdapter,
      contracts.notionalProxy,
      c.cashGroup !== null
    );
  });

  const { blockNumber, results } = await aggregate(
    _sNOTECalls.concat(currencyCalls),
    provider
  );
  return { blockNumber, results };
}
