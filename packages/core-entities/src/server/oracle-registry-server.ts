import {
  IAggregatorABI,
  IAggregator,
  BalancerPoolABI,
  BalancerPool,
} from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import {
  batchArray,
  getNowSeconds,
  Network,
  SCALAR_PRECISION,
  sNOTE,
  WETHAddress,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract, ethers } from 'ethers';
import { OracleDefinition, CacheSchema, SNOTEWeightedPool } from '..';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { fiatOracles } from '../config/fiat-config';
import { TypedDocumentNode } from '@apollo/client/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllOraclesQuery } from '../.graphclient';
import { Block } from '@ethersproject/providers';
import { fetchFromRegistry } from '../client';
import { parseUnits } from 'ethers/lib/utils';

// NOTE: this is currently hardcoded because we cannot access the worker
// process environment directly here.
const NX_REGISTRY_URL = 'https://registry.notional.finance';

const VaultOracleABI = new ethers.utils.Interface([
  'function price(address borrower) view external returns (uint256)',
  'function convertSharesToYieldToken(uint256 shares) view external returns (uint256)',
  // This one is on the lending router
  'function convertBorrowSharesToAssets(address vault, uint256 shares) view external returns (uint256)',
  // This one is on the withdraw request manager
  'function getExchangeRate() view external returns (uint256)',
  'function CURVE_POOL_TOKEN() view external returns (address)',
]);

const sNOTE_Pool = '0x5122E01D819E58BB2E22528c0D68D310f0AA6FD7';

export const sNOTEOracle = `${ZERO_ADDRESS}:${sNOTE_Pool}:sNOTEToETHExchangeRate`;

export class OracleRegistryServer extends ServerRegistry<OracleDefinition> {
  public override hasAllNetwork(): boolean {
    return true;
  }

  public static registerSNOTEOracle(
    pool: SNOTEWeightedPool,
    noteETHExchangeRate?: BigNumber
  ): OracleDefinition {
    return {
      id: sNOTEOracle,
      oracleAddress: sNOTE_Pool,
      network: Network.mainnet,
      oracleType: 'sNOTEToETHExchangeRate',
      base: ZERO_ADDRESS,
      quote: sNOTE,
      decimals: 18,
      latestRate: {
        blockNumber: 0,
        timestamp: getNowSeconds(),
        // Latest rate will get updated in the call below
        rate: pool.getCurrentSNOTEPrice(noteETHExchangeRate).n,
      },
    };
  }

  protected async _refresh(network: Network, blockNumber?: number) {
    if (network === Network.all) {
      return await this._updateLatestRates(
        this._fetchFiatOracles(),
        blockNumber
      );
    }

    const results = await this._queryAllOracles(network, blockNumber);
    results.values.push([
      'UNIT_RATE',
      {
        id: 'UNIT_RATE',
        base: ZERO_ADDRESS,
        quote: WETHAddress[network],
        network,
        oracleType: 'Chainlink',
        decimals: 18,
        oracleAddress: ZERO_ADDRESS,
        latestRate: {
          rate: SCALAR_PRECISION,
          timestamp: 2 ** 32,
          blockNumber: 2 ** 32,
        },
      },
    ]);

    if (network === Network.mainnet) {
      results.values.push([
        sNOTEOracle,
        {
          id: sNOTEOracle,
          oracleAddress: sNOTE_Pool,
          network: Network.mainnet,
          oracleType: 'sNOTEToETHExchangeRate',
          base: ZERO_ADDRESS,
          quote: sNOTE,
          decimals: 18,
          latestRate: {
            blockNumber: 0,
            timestamp: getNowSeconds(),
            // Latest rate will get updated in the call below
            rate: BigNumber.from(0),
          },
        },
      ]);
    }

    // Updates the latest rates using the blockchain
    const r = this._updateLatestRates(results, blockNumber);
    return r;
  }

  private async _queryAllOracles(network: Network, blockNumber?: number) {
    const { AllOraclesDocument, AllOraclesByBlockNumberDocument } =
      await loadGraphClientDeferred();

    try {
      return await this._fetchUsingGraph(
        network,
        (blockNumber !== undefined
          ? AllOraclesByBlockNumberDocument
          : AllOraclesDocument) as TypedDocumentNode<AllOraclesQuery, unknown>,
        (r) => {
          return r.oracles.reduce((obj, v) => {
            obj[v.id] = {
              id: v.id,
              oracleAddress: v.oracleAddress as string,
              network,
              oracleType: v.oracleType,
              base: v.base.id,
              baseDecimals: v.base.decimals,
              quote: v.quote.id,
              decimals: v.decimals,
              yieldToken: v.quote.vaultAddress?.yieldToken?.id,
              strategyType: v.quote.vaultAddress?.strategyType,
              latestRate: {
                rate: BigNumber.from(v.latestRate),
                timestamp: v.lastUpdateTimestamp,
                blockNumber: parseInt(blockNumber || v.lastUpdateBlockNumber),
              },
            };

            return obj;
          }, {} as Record<string, OracleDefinition & { yieldToken?: string; strategyType?: string }>);
        },
        this.env.NX_SUBGRAPH_API_KEY,
        {
          blockNumber,
          skip: 0,
        },
        'oracles'
      );
    } catch (e) {
      console.error(e);
      // If the subgraph has failed, get the previous cache schema and return it, we still
      // want to continue to update the latest rates
      return fetchFromRegistry<CacheSchema<OracleDefinition>>(
        `${network}/oracles`,
        NX_REGISTRY_URL
      ).then((c) => ({
        ...c,
        values: c.values.map(([id, oracle]) => [
          id,
          {
            ...oracle,
            latestRate: {
              ...oracle?.latestRate,
              blockNumber:
                typeof oracle?.latestRate?.blockNumber === 'string'
                  ? parseInt(oracle?.latestRate?.blockNumber)
                  : oracle?.latestRate?.blockNumber,
            },
          },
        ]),
      })) as Promise<CacheSchema<OracleDefinition>>;
    }
  }

  /**
   * Calls the blockchain and gets the latest rates for some of the oracle definitions,
   * overrides the latestRate property in each oracle with newer rates.
   */
  private async _updateLatestRates(
    schema: CacheSchema<OracleDefinition>,
    blockNumber?: number
  ): Promise<CacheSchema<OracleDefinition>> {
    const realTimePrices = await this._getPriceFromDefiLlama(schema);
    const calls = await this._getOnChainCalls(schema, realTimePrices);
    const batchedCalls = batchArray(calls, 100);

    let block: Block | undefined;
    let results: Record<
      string,
      {
        rate: BigNumber;
        timestamp?: number | undefined;
      }
    > = realTimePrices;

    for (const b of batchedCalls) {
      const { block: _b, results: _r } = await aggregate(
        b,
        this.getProvider(schema.network),
        blockNumber,
        true
      );
      block = _b;
      results = Object.assign(results, _r);
    }

    return {
      values: schema.values.map(([id, oracle]) => {
        if (results[id] && oracle) {
          return [
            id,
            {
              ...oracle,
              // Overrides the latest rate property in the oracle record
              latestRate: {
                rate: results[id].rate,
                timestamp: results[id].timestamp || block?.timestamp || 0,
                blockNumber: block?.number || 0,
              },
            },
          ];
        } else {
          return [id, oracle];
        }
      }),
      network: schema.network,
      lastUpdateBlock: block?.number || 0,
      lastUpdateTimestamp: block?.timestamp || 0,
    };
  }

  private async _getPriceFromDefiLlama(
    results: CacheSchema<
      OracleDefinition & { yieldToken?: string; strategyType?: string }
    >
  ): Promise<Record<string, { rate: BigNumber; timestamp: number }>> {
    const provider = this.getProvider(results.network);
    const poolTokens = await aggregate<string>(
      results.values
        .filter(
          ([_, oracle]) =>
            oracle?.oracleType === 'VaultShareOracleRate' &&
            oracle?.strategyType === 'CurveConvex2Token'
        )
        .map(([_, oracle]) => {
          if (!oracle || !oracle.yieldToken) return null;

          return {
            key: oracle.yieldToken,
            target: new Contract(
              oracle.oracleAddress,
              VaultOracleABI,
              provider
            ),
            method: 'CURVE_POOL_TOKEN',
            args: [],
          };
        })
        .filter((v) => v !== null) as AggregateCall[],
      provider
    ).then(({ results: r }) => r);

    // All vaults have a Chainlink oracle, so we get them here.
    const coins = results.values
      .filter(
        ([_, oracle]) =>
          oracle?.oracleType === 'Chainlink' && oracle.id !== 'UNIT_RATE'
      )
      .map(([id, oracle]) => {
        if (!oracle) return null;
        // If there is a pool token it is because we are rewriting the Convex token
        // to the LP pool token.
        const coin = poolTokens[oracle.quote] || oracle.quote;
        if (!coin) return null;

        return {
          id,
          coin: `${
            oracle.network === Network.mainnet ? 'ethereum' : oracle.network
          }:${coin}`,
        };
      })
      .filter((v) => v !== null);

    const url = `https://coins.llama.fi/prices/current/${coins
      .map((c) => c.coin)
      .join(',')}`;

    // All of these prices are in USD, so we need to convert them using the oracle decimals
    const prices: {
      coins: { [key: string]: { price: number; timestamp: number } };
    } = (await fetch(url)
      .then((r) => r.json())
      .catch((e) => {
        console.error('Error fetching prices from DefiLlama', e);
        return {
          coins: {},
        };
      })) as unknown as {
      coins: { [key: string]: { price: number; timestamp: number } };
    };

    // All these prices are to USD.
    return coins
      .map((c) => {
        const quotePrice = prices.coins[c.coin]?.price;
        const oracle = results.values.find(([id, _]) => id === c.id)?.[1];
        if (!quotePrice || !oracle) return null;

        // Scale the floating point number to BigNumber with specified decimal precision
        const formattedPrice = Number(quotePrice).toFixed(oracle.decimals);
        return {
          id: c.id,
          rate: parseUnits(formattedPrice, oracle.decimals),
          timestamp: prices.coins[c.coin]?.timestamp,
        };
      })
      .filter((v) => v !== null)
      .reduce((acc, v) => {
        acc[v.id] = v;
        return acc;
      }, {} as Record<string, { rate: BigNumber; timestamp: number }>);
  }

  /** Returns an array of aggregate calls that will override the latest rates in the oracles */
  private async _getOnChainCalls(
    results: CacheSchema<OracleDefinition>,
    realTimePrices: Record<string, { rate: BigNumber; timestamp: number }>
  ): Promise<AggregateCall<{ rate: BigNumber; timestamp?: number }>[]> {
    const provider = this.getProvider(results.network);

    return results.values
      .map(([id, oracle]) => {
        if (!oracle) return null;
        // Prefer real time prices over on chain prices
        if (realTimePrices[id]) return null;

        if (
          oracle.oracleType === 'Chainlink' &&
          oracle.oracleAddress !== ZERO_ADDRESS
        ) {
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              IAggregatorABI,
              provider
            ),
            method: 'latestRoundData',
            args: [],
            transform: (
              r: Awaited<
                ReturnType<IAggregator['functions']['latestRoundData']>
              >
            ) => ({ rate: r.answer, timestamp: r.updatedAt.toNumber() }),
          };
        } else if (oracle.oracleType === 'VaultShareOracleRate') {
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              VaultOracleABI,
              provider
            ),
            method: 'price',
            args: [ZERO_ADDRESS],
            transform: (r: BigNumber) => ({ rate: r }),
          };
        } else if (oracle.oracleType === 'VaultFeeAccrualRate') {
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              VaultOracleABI,
              provider
            ),
            method: 'convertSharesToYieldToken',
            args: [SCALAR_PRECISION],
            transform: (r: BigNumber) => ({ rate: r }),
          };
        } else if (oracle.oracleType === 'BorrowShareOracleRate') {
          const vault = oracle.id.split(':')[0];
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              VaultOracleABI,
              provider
            ),
            method: 'convertBorrowSharesToAssets',
            args: [vault, BigNumber.from(10).pow(oracle.baseDecimals || 0)],
            transform: (r: BigNumber) => ({ rate: r }),
          };
        } else if (oracle.oracleType === 'WithdrawTokenExchangeRate') {
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              VaultOracleABI,
              provider
            ),
            method: 'getExchangeRate',
            args: [],
            transform: (r: BigNumber) => ({ rate: r }),
          };
        } else if (
          oracle.oracleType === 'sNOTEToETHExchangeRate' ||
          oracle.oracleType === 'sNOTE'
        ) {
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              BalancerPoolABI,
              provider
            ),
            method: 'getTimeWeightedAverage',
            args: [[[0, 21600, 0]]], // Get average pair price from 1800 seconds ago
            transform: (
              r: Awaited<ReturnType<BalancerPool['getTimeWeightedAverage']>>
            ) => ({ rate: r[0] }),
          };
        } else {
          return null;
        }
      })
      .filter((v) => v !== null) as AggregateCall[];
  }

  private _fetchFiatOracles(): CacheSchema<OracleDefinition> {
    return {
      values: fiatOracles,
      network: Network.all,
      lastUpdateBlock: 0,
      lastUpdateTimestamp: 0,
    };
  }
}
