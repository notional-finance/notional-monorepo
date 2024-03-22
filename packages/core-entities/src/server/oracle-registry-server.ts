import {
  IAggregatorABI,
  IAggregator,
  IStrategyVaultABI,
  NotionalV3ABI,
  NotionalV3,
  BalancerPoolABI,
  BalancerPool,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import {
  decodeERC1155Id,
  getNowSeconds,
  INTERNAL_TOKEN_PRECISION,
  Network,
  NotionalAddress,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { OracleDefinition, CacheSchema } from '..';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { fiatOracles } from '../config/fiat-config';
import { TypedDocumentNode } from '@apollo/client/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllOraclesQuery } from '../.graphclient';
import { vaultOverrides } from './vault-overrides';

export class OracleRegistryServer extends ServerRegistry<OracleDefinition> {
  public override hasAllNetwork(): boolean {
    return true;
  }

  protected async _refresh(network: Network, blockNumber?: number) {
    if (network === Network.all) {
      return await this._updateLatestRates(
        this._fetchFiatOracles(),
        blockNumber
      );
    }

    const results = await this._queryAllOracles(network, blockNumber);
    // Updates the latest rates using the blockchain
    return this._updateLatestRates(results, blockNumber);
  }

  private async _queryAllOracles(network: Network, blockNumber?: number) {
    const { AllOraclesDocument, AllOraclesByBlockDocument } =
      await loadGraphClientDeferred();

    return this._fetchUsingGraph(
      network,
      (blockNumber !== undefined
        ? AllOraclesByBlockDocument
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
            quoteCurrencyId: v.quote.currencyId,
            decimals: v.decimals,
            latestRate: {
              rate: BigNumber.from(v.latestRate),
              timestamp: v.lastUpdateTimestamp,
              blockNumber: blockNumber || v.lastUpdateBlockNumber,
            },
          };

          return obj;
        }, {} as Record<string, OracleDefinition>);
      },
      {
        blockNumber,
      }
    );
  }

  /**
   * Calls the blockchain and gets the latest rates for some of the oracle definitions,
   * overrides the latestRate property in each oracle with newer rates.
   */
  private async _updateLatestRates(
    schema: CacheSchema<OracleDefinition>,
    blockNumber?: number
  ): Promise<CacheSchema<OracleDefinition>> {
    const calls = await this._getAggregateCalls(schema, blockNumber);
    const { block, results } = await aggregate(
      calls,
      this.getProvider(schema.network),
      blockNumber,
      true
    );
    const timestamp = block.timestamp;

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
                blockNumber: block.number,
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
  private async _getAggregateCalls(
    results: CacheSchema<OracleDefinition>,
    blockNumber?: number
  ): Promise<AggregateCall<BigNumber>[]> {
    const provider = this.getProvider(results.network);
    let ts = getNowSeconds();
    if (blockNumber) {
      const block = await provider.getBlock(blockNumber);
      ts = block.timestamp;
    } else {
      blockNumber = await provider.getBlockNumber();
    }

    const notional = new Contract(
      NotionalAddress[results.network],
      NotionalV3ABI,
      provider
    ) as NotionalV3;

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
            ) => r.answer,
          };
        } else if (oracle.oracleType === 'VaultShareOracleRate') {
          const { maturity } = decodeERC1155Id(oracle.quote);
          const override = vaultOverrides[oracle.oracleAddress];
          if (override) {
            const entry = override.find((o) => {
              if (o.fromBlock && blockNumber && blockNumber < o.fromBlock) {
                return false;
              }
              if (o.toBlock && blockNumber && blockNumber > o.toBlock) {
                return false;
              }
              return true;
            });

            if (entry) {
              return {
                key: id,
                target: new Contract(
                  oracle.oracleAddress,
                  IStrategyVaultABI,
                  provider
                ),
                method: 'convertStrategyToUnderlying',
                args: [
                  oracle.oracleAddress,
                  INTERNAL_TOKEN_PRECISION,
                  maturity,
                ],
              };
            }
          }

          return {
            key: id,
            target: new Contract(
              oracle.oracleAddress,
              ISingleSidedLPStrategyVaultABI,
              provider
            ),
            method: 'getExchangeRate',
            args: [maturity],
          };
        } else if (
          oracle.oracleType === 'fCashOracleRate' ||
          oracle.oracleType === 'fCashSpotRate'
        ) {
          const { maturity, currencyId } = decodeERC1155Id(oracle.quote);
          return {
            key: id,
            target: notional,
            method: 'getActiveMarkets',
            args: [currencyId],
            transform: (
              r: Awaited<ReturnType<NotionalV3['getActiveMarkets']>>
            ) => {
              const market = r.find((m) => m.maturity.toNumber() === maturity);
              return oracle.oracleType === 'fCashOracleRate'
                ? market?.oracleRate
                : market?.lastImpliedRate;
            },
          };
        } else if (
          oracle.oracleType === 'PrimeCashToUnderlyingExchangeRate' ||
          oracle.oracleType === 'PrimeDebtToUnderlyingExchangeRate' ||
          oracle.oracleType === 'PrimeCashToUnderlyingOracleInterestRate'
        ) {
          return {
            key: id,
            target: notional,
            method: 'getPrimeFactors',
            args: [oracle.quoteCurrencyId, getNowSeconds()],
            transform: (
              r: Awaited<ReturnType<NotionalV3['getPrimeFactors']>>
            ) => {
              if (oracle.oracleType === 'PrimeCashToUnderlyingExchangeRate') {
                return r.primeRate.supplyFactor;
              } else if (
                oracle.oracleType === 'PrimeDebtToUnderlyingExchangeRate'
              ) {
                return r.primeRate.debtFactor;
              } else {
                return r.primeRate.oracleSupplyRate;
              }
            },
          };
        } else if (
          oracle.oracleType === 'PrimeCashPremiumInterestRate' ||
          oracle.oracleType === 'PrimeDebtPremiumInterestRate'
        ) {
          if (JSON.parse(process.env['HAS_ABI_VERSIONING'] || 'false')) {
            return {
              key: id,
              target: notional,
              method: 'getPrimeInterestRate',
              args: [oracle.quoteCurrencyId],
              transform: (
                r: Awaited<ReturnType<NotionalV3['getPrimeInterestRate']>>
              ) => {
                return oracle.oracleType === 'PrimeCashPremiumInterestRate'
                  ? r.annualSupplyRate
                  : r.annualDebtRatePostFee;
              },
            };
          } else {
            return null;
          }
        } else if (oracle.oracleType === 'nTokenToUnderlyingExchangeRate') {
          return {
            key: id,
            target: notional,
            method: 'convertNTokenToUnderlying',
            args: [oracle.quoteCurrencyId, INTERNAL_TOKEN_PRECISION],
            transform: (
              r: Awaited<ReturnType<NotionalV3['convertNTokenToUnderlying']>>
            ) => {
              if (!oracle.baseDecimals) throw Error('base decimals undefined');
              return r
                .mul(BigNumber.from(10).pow(oracle.decimals))
                .div(BigNumber.from(10).pow(oracle.baseDecimals));
            },
          };
        } else if (oracle.oracleType === 'fCashToUnderlyingExchangeRate') {
          const { maturity, currencyId } = decodeERC1155Id(oracle.quote);
          return {
            key: id,
            target: notional,
            method: 'getPresentfCashValue',
            args: [currencyId, maturity, INTERNAL_TOKEN_PRECISION, ts, false],
            transform: (
              r: Awaited<ReturnType<NotionalV3['getPresentfCashValue']>>
            ) => {
              return r
                .mul(BigNumber.from(10).pow(oracle.decimals))
                .div(INTERNAL_TOKEN_PRECISION);
            },
          };
        } else if (oracle.oracleType === 'sNOTE') {
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
            ) => r[0],
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
