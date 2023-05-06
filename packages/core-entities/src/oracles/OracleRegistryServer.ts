import { IAggregatorABI, IAggregator } from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import {
  decodeERC1155Id,
  INTERNAL_TOKEN_PRECISION,
  Network,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { OracleDefinition } from '..';
import { AllOraclesQuery, getBuiltGraphSDK } from '../.graphclient';
import { CacheSchema } from '../registry/index';
import { ServerRegistry } from '../registry/ServerRegistry';

export class OracleRegistryServer extends ServerRegistry<OracleDefinition> {
  public NUM_HISTORICAL_RATES = 25;
  // Interval refreshes only update the latest rates
  public INTERVAL_REFRESH_SECONDS = 10;
  // Configuration refreshes every hour and updates all information
  public CONFIG_REFRESH_SECONDS = 360;

  protected async _refresh(network: Network, intervalNum: number) {
    let results: CacheSchema<OracleDefinition>;

    if (
      intervalNum %
        (this.CONFIG_REFRESH_SECONDS / this.INTERVAL_REFRESH_SECONDS) ==
      0
    ) {
      // Trigger a refresh of the oracle configuration, this will happen when intervalNum == 0 as well
      results = await this._queryAllOracles(network, this.NUM_HISTORICAL_RATES);
    } else {
      // Get the current oracle configuration from the subjects
      const values = Array.from(
        this.getLatestFromAllSubjects(network).entries()
      );

      results = {
        values,
        network,
        lastUpdateTimestamp: this.getLastUpdateTimestamp(network),
        lastUpdateBlock: this.getLastUpdateBlock(network),
      };
    }

    // Updates the latest rates using the blockchain
    return this._updateLatestRates(results);
  }

  private _queryAllOracles(network: Network, numHistoricalRates: number) {
    const sdk = getBuiltGraphSDK();
    return this._fetchUsingGraph<AllOraclesQuery>(
      network,
      sdk.AllOracles,
      (r) => {
        return r.oracles.reduce((obj, v) => {
          obj[v.id] = {
            id: v.id,
            oracleAddress: v.oracleAddress as string,
            network,
            oracleType: v.oracleType,
            base: v.base.id,
            quote: v.quote.id,
            decimals: v.decimals,
            latestRate: {
              rate: BigNumber.from(v.latestRate),
              timestamp: v.lastUpdateTimestamp,
              blockNumber: v.lastUpdateBlockNumber,
            },
            historicalRates:
              v.historicalRates?.map((h) => {
                return {
                  rate: BigNumber.from(h.rate),
                  timestamp: h.timestamp,
                  blockNumber: h.blockNumber,
                };
              }) || [],
          };

          return obj;
        }, {} as Record<string, OracleDefinition>);
      },
      { numHistoricalRates }
    );
  }

  /**
   * Calls the blockchain and gets the latest rates for some of the oracle definitions,
   * overrides the latestRate property in each oracle with newer rates.
   */
  private async _updateLatestRates(
    schema: CacheSchema<OracleDefinition>
  ): Promise<CacheSchema<OracleDefinition>> {
    const calls = this._getAggregateCalls(schema);
    const { block, results } = await aggregate(
      calls,
      this.getProvider(schema.network)
    );
    const timestamp = block.timestamp;
    const blockNumber = block.number;

    return {
      values: schema.values.map(([id, oracle]) => {
        if (results[id] && oracle) {
          return [
            id,
            Object.assign(oracle, {
              // Overrides the latest rate property in the oracle record
              latestRate: {
                rate: results[id],
                timestamp,
                blockNumber,
              },
            }),
          ];
        } else {
          return [id, oracle];
        }
      }),
      network: schema.network,
      lastUpdateBlock: block.number,
      lastUpdateTimestamp: block.timestamp,
    };
  }

  /** Returns an array of aggregate calls that will override the latest rates in the oracles */
  private _getAggregateCalls(
    results: CacheSchema<OracleDefinition>
  ): AggregateCall<BigNumber>[] {
    const provider = this.getProvider(results.network);
    return results.values
      .map(([id, oracle]) => {
        if (!oracle) return null;
        if (
          oracle?.oracleType === 'Chainlink' &&
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
            ) => r.answer,
          };
        } else if (oracle?.oracleType === 'VaultShareOracleRate') {
          const { maturity } = decodeERC1155Id(oracle.quote);
          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              IStrategyVaultABI,
              provider
            ),
            method: 'convertStrategyToUnderlying',
            args: [oracle.oracleAddress, INTERNAL_TOKEN_PRECISION, maturity],
          };
        } else {
          return null;
        }
      })
      .filter((v) => v !== null) as AggregateCall[];
  }
}
