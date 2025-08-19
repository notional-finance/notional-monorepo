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
import {
  OracleDefinition,
  CacheSchema,
  SNOTEWeightedPool,
  PendlePTVaults,
} from '..';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { fiatOracles } from '../config/fiat-config';
import { TypedDocumentNode } from '@apollo/client/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllOraclesQuery } from '../.graphclient';
import { Block } from '@ethersproject/providers';
import { fetchFromRegistry } from '../client';

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
              decimals:
                // Override PT vault addresses b/c the decimals are not right in the subgraph
                PendlePTVaults[network].includes(v.oracleAddress)
                  ? 18
                  : v.decimals,
              latestRate: {
                rate: BigNumber.from(v.latestRate),
                timestamp: v.lastUpdateTimestamp,
                blockNumber: parseInt(blockNumber || v.lastUpdateBlockNumber),
              },
            };

            return obj;
          }, {} as Record<string, OracleDefinition>);
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
    const calls = await this._getAggregateCalls(schema);
    const batchedCalls = batchArray(calls, 100);

    let block: Block | undefined;
    let results: Record<
      string,
      {
        rate: BigNumber;
        timestamp?: number | undefined;
      }
    > = {};
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

  /** Returns an array of aggregate calls that will override the latest rates in the oracles */
  private async _getAggregateCalls(
    results: CacheSchema<OracleDefinition>
  ): Promise<AggregateCall<{ rate: BigNumber; timestamp?: number }>[]> {
    const provider = this.getProvider(results.network);

    return results.values
      .map(([id, oracle]) => {
        if (!oracle) return null;

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
