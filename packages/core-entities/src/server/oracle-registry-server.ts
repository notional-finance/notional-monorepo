import {
  IAggregatorABI,
  IAggregator,
  IStrategyVaultABI,
  NotionalV3ABI,
  Notional,
} from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import {
  decodeERC1155Id,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { OracleDefinition, CacheSchema } from '..';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';

export class OracleRegistryServer extends ServerRegistry<OracleDefinition> {
  // Interval refreshes only update the latest rates
  public INTERVAL_REFRESH_SECONDS = 10;
  // Configuration refreshes every hour and updates all information
  public CONFIG_REFRESH_SECONDS = 360;

  protected async _refresh(network: Network, intervalNum: number) {
    let results: CacheSchema<OracleDefinition>;

    if (
      intervalNum %
        (this.CONFIG_REFRESH_SECONDS / this.INTERVAL_REFRESH_SECONDS) ==
        0 ||
      this.isNetworkRegistered(network) === false
    ) {
      // Trigger a refresh of the oracle configuration, this will happen when intervalNum == 0 as well
      results = await this._queryAllOracles(network);
    } else {
      // Get the current oracle configuration from the subjects
      const values = Array.from(
        this.getLatestFromAllSubjects(network, 0).entries()
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

  private async _queryAllOracles(network: Network) {
    const { AllOraclesDocument } = await loadGraphClientDeferred();
    return this._fetchUsingGraph(network, AllOraclesDocument, (r) => {
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
        };

        return obj;
      }, {} as Record<string, OracleDefinition>);
    });
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
        } else if (oracle?.oracleType === 'fCashOracleRate') {
          const { maturity, currencyId } = decodeERC1155Id(oracle.quote);
          const notional = NotionalAddress[oracle.network];
          return {
            key: id,
            target: new Contract(notional, NotionalV3ABI, provider),
            method: 'getActiveMarkets',
            args: [currencyId],
            transform: (
              r: Awaited<ReturnType<Notional['getActiveMarkets']>>
            ) => {
              return r.find((m) => m.maturity.toNumber() === maturity)
                ?.oracleRate;
            },
          };
        } else {
          return null;
        }
      })
      .filter((v) => v !== null) as AggregateCall[];
  }
}
