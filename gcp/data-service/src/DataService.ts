import ethers, { BigNumber } from 'ethers';
import { Knex } from 'knex';
import {
  Network,
  getProviderFromNetwork,
  isIdiosyncratic,
  ORACLE_TYPE_TO_ID,
  ONE_HOUR_MS,
  RATE_DECIMALS,
  RATE_PRECISION,
  PRIME_CASH_VAULT_MATURITY,
} from '@notional-finance/util';
import {
  AccountFetchMode,
  TokenBalance,
  TokenType,
  fCashMarket,
} from '@notional-finance/core-entities';
import { fetch } from 'cross-fetch';
import {
  buildOperations,
  defaultConfigDefs,
  defaultDataWriters,
} from './config';
import {
  BackfillType,
  DataType,
  DataRow,
  MulticallConfig,
  MulticallOperation,
  SubgraphConfig,
  SubgraphOperation,
  TableName,
  VaultAccount,
} from './types';
import { aggregate } from '@notional-finance/multicall';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { HistoricalRegistry } from './HistoricalRegistry';

// TODO: fetch from DB
const networkToId = {
  all: 0,
  mainnet: 1,
  arbitrum: 2,
};

export type DataServiceSettings = {
  // TODO: support multiple networks
  network: Network;
  blocksPerSecond: Record<string, number>;
  maxProviderRequests: number;
  interval: number;
  frequency: number; // hourly, daily etc.
  startingBlock: number;
  registryUrl: string;
  dataUrl: string;
  mergeConflicts: boolean;
  backfillDelayMs: number;
};

export default class DataService {
  public static readonly TS_BN_MAPPINGS_TABLE_NAME = 'ts_bn_mappings';
  public static readonly ORACLE_DATA_TABLE_NAME = 'oracle_data';
  public static readonly ACCOUNTS_TABLE_NAME = 'accounts';
  public static readonly VAULT_ACCOUNTS_TABLE_NAME = 'vault_accounts';
  public static readonly WHITELISTED_VIEWS = 'whitelisted_views';

  constructor(
    public provider: ethers.providers.Provider,
    public db: Knex,
    public settings: DataServiceSettings
  ) {}

  private getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  public networkToId(network: Network) {
    return networkToId[network];
  }

  public idToNetwork(id: number) {
    return this.getKeyByValue(networkToId, id);
  }

  public oracleTypeToId(oracleType: string) {
    return ORACLE_TYPE_TO_ID[oracleType];
  }

  public idToOracleType(id: number) {
    return this.getKeyByValue(ORACLE_TYPE_TO_ID, id);
  }

  public latestTimestamp() {
    return this.intervalTimestamp(Date.now() / 1000);
  }

  private intervalTimestamp(ts: number) {
    const now = new Date(ts * 1000);
    // TODO: make this configurable
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.getTime() / 1000;
  }

  public getTimestamps(startTime: number, endTime: number) {
    startTime = this.intervalTimestamp(startTime);
    endTime = this.intervalTimestamp(endTime);
    if (startTime === endTime) {
      return [];
    }
    const timestamps: number[] = [];
    while (startTime < endTime) {
      timestamps.push(startTime);
      startTime += this.settings.interval * this.settings.frequency;
    }

    return timestamps;
  }

  public async backfill(
    startTime: number,
    endTime: number,
    type: BackfillType
  ) {
    const timestamps = this.getTimestamps(startTime, endTime);
    console.log(
      `backfilling from ${startTime} to ${endTime}, ${timestamps.length} timestamps`
    );
    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i];
      console.log(`backfilling ${ts}`);
      try {
        if (type === BackfillType.GenericData) {
          await this.syncGenericData(ts);
        } else if (type === BackfillType.OracleData) {
          await this.syncOracleData(ts);
        } else if (type === BackfillType.YieldData) {
          await this.syncYieldData(ts);
        } else {
          throw Error(`Invalid backfill type ${type}`);
        }
      } catch (e: any) {
        console.error(`Failed to backfill ${ts}, ${e.toString()}`);
      }
      await new Promise((r) => setTimeout(r, this.settings.backfillDelayMs));
    }
  }

  public async getBlockNumberFromTs(network: Network, ts: number) {
    if (network === Network.All) {
      network = Network.Mainnet;
    }

    const networkId = this.networkToId(network);
    if (!networkId) {
      throw Error(`Invalid network ${network}`);
    }
    ts = this.intervalTimestamp(ts);
    // get blockNumber by timestamp
    const record = await this.db
      .select()
      .from(DataService.TS_BN_MAPPINGS_TABLE_NAME)
      .where('timestamp', ts)
      .andWhere('network_id', networkId);
    let blockNumber = 0;
    if (record.length === 0) {
      blockNumber = await this.getBlockNumberByTimestamp(network, ts);
      await this.db
        .insert([
          {
            timestamp: ts,
            block_number: blockNumber,
            network_id: networkId,
          },
        ])
        .into(DataService.TS_BN_MAPPINGS_TABLE_NAME);
    } else {
      blockNumber = parseInt(record[0].block_number);
    }

    return blockNumber;
  }

  public async syncOracleData(ts: number) {
    const networks = [Network.All, Network.ArbitrumOne];

    for (const network of networks) {
      const blockNumber = await this.getBlockNumberFromTs(network, ts);

      const values = await this.getData(network, blockNumber, DataType.ORACLE);

      if (values.length > 0) {
        const query = this.db
          .insert(
            values.map((v) => ({
              base: v[1].base,
              quote: v[1].quote,
              oracle_type: this.oracleTypeToId(v[1].oracleType),
              network: this.networkToId(v[1].network),
              timestamp: ts,
              block_number: blockNumber,
              decimals: v[1].decimals,
              oracle_address: v[1].oracleAddress,
              latest_rate: BigNumber.from(v[1].latestRate.rate.hex).toString(),
            }))
          )
          .into(DataService.ORACLE_DATA_TABLE_NAME)
          .onConflict(['base', 'quote', 'oracle_type', 'network', 'timestamp']);

        if (this.settings.mergeConflicts) {
          await query.merge();
        } else {
          await query.ignore();
        }
      }
    }

    return 'OK';
  }

  private async _getTvl(
    network: Network,
    block: ethers.ethers.providers.Block,
    tokenType: TokenType
  ) {
    const tokens = HistoricalRegistry.getTokenRegistry();
    const exchanges = HistoricalRegistry.getExchangeRegistry();
    const allTokens = tokens.getAllTokens(network);

    return allTokens
      .filter(
        (t) =>
          t.tokenType === tokenType &&
          (t.maturity ? t.maturity > block.timestamp : true)
      )
      .map((t) => {
        if (!t.currencyId) throw Error('Missing currency id');
        if (!t.underlying) throw Error(`Token has no underlying`);
        const market = exchanges.getfCashMarket(network, t.currencyId);
        const interestAPY = market.getSpotInterestRate(t) || 0;
        const underlying = tokens.getTokenByID(network, t.underlying);
        let tvl;
        try {
          tvl = t.totalSupply?.toUnderlying() || TokenBalance.zero(underlying);
        } catch (e: any) {
          console.warn(
            `Failed to get tvl ${block.number} ${t.currencyId}, ${t.underlying}: ` +
              +e.toString()
          );
          throw e;
        }

        return {
          token: t,
          underlying: t.underlying,
          tvl: tvl,
          totalAPY: interestAPY,
          interestAPY,
        };
      });
  }

  private async _getFCashTvl(
    network: Network,
    block: ethers.ethers.providers.Block
  ) {
    const tokens = HistoricalRegistry.getTokenRegistry();
    const exchanges = HistoricalRegistry.getExchangeRegistry();

    const fCashData = await this._getTvl(network, block, 'fCash');

    fCashData
      .filter(
        (y) =>
          y.token.isFCashDebt === false &&
          !!y.token.maturity &&
          !isIdiosyncratic(y.token.maturity)
      )
      .map((y) => {
        if (!y.token.maturity) throw Error();

        const nToken = tokens.getNToken(network, y.token.currencyId);
        const fCashMarket = exchanges.getPoolInstance<fCashMarket>(
          network,
          nToken.address
        );
        const marketIndex = fCashMarket.getMarketIndex(y.token.maturity);
        const pCash = fCashMarket.poolParams.perMarketCash[marketIndex - 1];
        const fCash = fCashMarket.poolParams.perMarketfCash[marketIndex - 1];

        let tvl;
        try {
          tvl = fCash.toUnderlying().add(pCash.toUnderlying());
        } catch (e: any) {
          console.warn(
            `Failed to get tvl ${block.number} ${y.token.address}: ` +
              e.toString()
          );
        }

        // Adds the prime cash value in the nToken to the fCash TVL
        return Object.assign(y, {
          tvl: tvl,
        });
      });

    return fCashData;
  }

  private _convertRatioToYield(num: TokenBalance, denom: TokenBalance) {
    if (num.isZero()) return 0;

    return (
      (num.toToken(denom.token).ratioWith(denom).toNumber() * 100) /
      RATE_PRECISION
    );
  }

  private async _getNTokenTvl(network: Network, yields: any) {
    const exchanges = HistoricalRegistry.getExchangeRegistry();
    const config = HistoricalRegistry.getConfigurationRegistry();
    const tokens = HistoricalRegistry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter((t) => t.tokenType === 'nToken')
      .map((t) => {
        let tvl;
        let totalAPY;
        let interestAPY;

        const fCashMarket = exchanges.getPoolInstance<fCashMarket>(
          network,
          t.address
        );
        if (!t.underlying) throw Error('underlying not defined');
        const underlying = tokens.getTokenByID(network, t.underlying);

        try {
          const { incentiveEmissionRate: annualizedNOTEIncentives } =
            config.getAnnualizedNOTEIncentives(t);
          const nTokenTVL = fCashMarket.totalValueLocked(0);

          // Total fees over the last week divided by the total value locked
          const incentiveAPY = this._convertRatioToYield(
            annualizedNOTEIncentives,
            nTokenTVL
          );

          const { numerator, denominator } = fCashMarket.balances
            .map((b) => {
              const underlying = b.toUnderlying();
              const apy = yields.find(
                (y) => y.token.id === b.tokenId
              )?.totalAPY;
              if (apy === undefined) {
                throw Error(`${b.symbol} yield not found`);
              }

              // Blended yield is the weighted average of the APYs
              return {
                numerator: underlying
                  .mulInRatePrecision(Math.floor(apy * RATE_PRECISION))
                  .scaleTo(RATE_DECIMALS),
                denominator: underlying.scaleTo(RATE_DECIMALS),
              };
            })
            .reduce(
              (r, { numerator, denominator }) => ({
                numerator: r.numerator + numerator.toNumber(),
                denominator: r.denominator + denominator.toNumber(),
              }),
              { numerator: 0, denominator: 0 }
            );
          interestAPY = numerator / denominator;

          totalAPY = incentiveAPY + interestAPY;

          tvl = t.totalSupply?.toUnderlying() || TokenBalance.zero(underlying);
        } catch (e: any) {
          console.warn(
            `Failed to get tvl ${underlying.address}: ` + e.toString()
          );
        }

        return {
          token: t,
          underlying: underlying.address,
          tvl: tvl,
          totalAPY: totalAPY,
          interestAPY,
        };
      });
  }

  private async _getLeveragedVaultYield(
    network: Network,
    block: ethers.ethers.providers.Block
  ) {
    const vaults = HistoricalRegistry.getVaultRegistry();
    const fCashYields = await this._getFCashTvl(network, block);
    const debtYields = (await this._getTvl(network, block, 'PrimeDebt')).concat(
      fCashYields
    );
    const tokens = HistoricalRegistry.getTokenRegistry();

    return tokens
      .getAllTokens(network)
      .filter(
        (v) =>
          v.tokenType === 'VaultShare' &&
          (v.maturity ? v.maturity > block.timestamp : true) &&
          !!v.vaultAddress &&
          vaults.isVaultEnabled(v.network, v.vaultAddress)
      )
      .flatMap((v) => {
        let tvl;
        const totalAPY = 0;

        if (!v.underlying) throw Error('underlying is not defined');
        const underlying = tokens.getTokenByID(network, v.underlying);

        try {
          const debt = debtYields.find(
            (d) =>
              d.token.currencyId === v.currencyId &&
              (v.maturity === PRIME_CASH_VAULT_MATURITY
                ? d.token.tokenType === 'PrimeDebt'
                : d.token.tokenType === 'fCash' &&
                  d.token.maturity === v.maturity)
          );

          if (!debt) throw Error('Matching debt not found');
          if (!v.vaultAddress) throw Error('Vault address not defined');
          // Ensures that the oracle registry side effect happens here so that we
          // can properly get the TVL value.
          vaults.getVaultAdapter(network, v.vaultAddress);

          tvl = v.totalSupply?.toUnderlying() || TokenBalance.zero(underlying);
        } catch (e: any) {
          console.warn(`Failed to get tvl: ` + e.toString());
        }

        return {
          token: v,
          underlying: underlying.address,
          totalAPY,
          interestAPY: 0,
          tvl: tvl,
        };
      });
  }

  public async syncYieldData(ts: number) {
    // TODO: support multiple networks here
    const network = Network.ArbitrumOne;

    const blockNumber = await this.getBlockNumberFromTs(network, ts);

    // Get data using block number
    if (blockNumber < this.settings.startingBlock) {
      // too old
      return;
    }

    HistoricalRegistry.initialize(
      'https://data-dev.notional-finance.workers.dev',
      AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER
    );

    await HistoricalRegistry.refreshAtBlock(
      Network.All,
      await this.getBlockNumberFromTs(Network.Mainnet, ts),
      ts
    );

    await HistoricalRegistry.refreshAtBlock(network, blockNumber, ts);

    const block = await this.provider.getBlock(blockNumber);

    const primeCashTvl = await this._getTvl(network, block, 'PrimeCash');
    const primeDebtTvl = await this._getTvl(network, block, 'PrimeDebt');
    const fCashTvl = await this._getFCashTvl(network, block);
    const yields = primeCashTvl.concat(primeDebtTvl).concat(fCashTvl);
    const nTokenTvl = await this._getNTokenTvl(network, yields);
    const vaultTvl = await this._getLeveragedVaultYield(network, block);

    const yieldData = primeCashTvl
      .concat(primeDebtTvl)
      .concat(fCashTvl)
      .concat(nTokenTvl)
      .concat(vaultTvl);

    if (yieldData.length > 0) {
      const yieldQuery = this.db
        .insert(
          yieldData.map((y) => {
            return {
              block_number: blockNumber,
              network_id: networkToId[network],
              token: y.token.id,
              total_value_locked: y.tvl?.toExactString(),
              underlying: y.underlying,
              total_apy: y.totalAPY,
              interest_apy: y.interestAPY,
              debt_token: '',
            };
          })
        )
        .into('yield_data')
        .onConflict([
          'token',
          'underlying',
          'debt_token',
          'network_id',
          'block_number',
        ]);

      if (this.settings.mergeConflicts) {
        await yieldQuery.merge();
      } else {
        await yieldQuery.ignore();
      }
    }

    return blockNumber;
  }

  private async syncFromMulticall(
    dbData: Map<TableName, DataRow[]>,
    network: Network,
    ts: number,
    operations: MulticallOperation[]
  ) {
    const blockNumber = await this.getBlockNumberFromTs(network, ts);
    const provider = getProviderFromNetwork(network, true);
    const filteredOps = operations.filter((op) => {
      const sourceConfig = op.configDef.sourceConfig as MulticallConfig;
      if (sourceConfig.firstBlock && blockNumber < sourceConfig.firstBlock) {
        return false;
      }
      if (sourceConfig.finalBlock && blockNumber > sourceConfig.finalBlock) {
        return false;
      }
      return true;
    });
    const calls = filteredOps.map((op) => op.aggregateCall);
    const response = await aggregate(calls, provider, blockNumber, true);

    filteredOps.forEach((op) => {
      let values = dbData.get(op.configDef.tableName);
      if (!values) {
        values = [];
        dbData.set(op.configDef.tableName, values);
      }
      const sourceConfig = op.configDef.sourceConfig as MulticallConfig;
      const key = op.aggregateCall.key as string;
      values.push({
        dataConfig: op.configDef.dataConfig,
        value: response.results[key],
        networkId: this.networkToId(network),
        blockNumber: blockNumber,
        contractAddress: sourceConfig.contractAddress,
        method: sourceConfig.method,
      });
    });
  }

  private async syncFromSubgraph(
    dbData: Map<TableName, DataRow[]>,
    network: Network,
    ts: number,
    operations: SubgraphOperation[]
  ) {
    const blockNumber = await this.getBlockNumberFromTs(network, ts);
    const results = await Promise.all(
      operations.map((op) => {
        const client = new ApolloClient({
          link: new HttpLink({
            uri: op.endpoint,
            fetch,
          }),
          cache: new InMemoryCache(),
        });

        const sourceConfig = op.configDef.sourceConfig as SubgraphConfig;
        return client.query({
          query: op.subgraphQuery,
          variables: {
            ts: ts,
            dayStart: ts - (ONE_HOUR_MS * 24) / 1000,
            hourStart: ts - ONE_HOUR_MS / 1000,
            ...(sourceConfig.args || {}),
          },
        });
      })
    );

    operations.forEach((op, i) => {
      const sourceConfig = op.configDef.sourceConfig as SubgraphConfig;
      let data = results[i].data;
      if (sourceConfig.transform) {
        data = sourceConfig.transform(data);
      }

      let values = dbData.get(op.configDef.tableName);
      if (!values) {
        values = [];
        dbData.set(op.configDef.tableName, values);
      }
      values.push({
        dataConfig: op.configDef.dataConfig,
        blockNumber: blockNumber,
        networkId: this.networkToId(network),
        value: data,
      });
    });
  }

  public async syncGenericData(ts: number) {
    const operations = buildOperations(defaultConfigDefs);
    const dbData = new Map<TableName, DataRow[]>();
    await Promise.all(
      Array.from(operations.aggregateCalls.keys()).map((network) =>
        this.syncFromMulticall(
          dbData,
          network,
          ts,
          operations.aggregateCalls.get(network) || []
        )
      )
    );

    await Promise.all(
      Array.from(operations.subgraphCalls.keys()).map((network) =>
        this.syncFromSubgraph(
          dbData,
          network,
          ts,
          operations.subgraphCalls.get(network) || []
        )
      )
    );

    return Promise.all(
      Array.from(dbData.keys()).map((k) => {
        defaultDataWriters[k].write(
          this.db,
          {
            tableName: k,
            timestamp: ts,
            mergeConflicts: this.settings.mergeConflicts,
          },
          dbData.get(k) || []
        );
      })
    );
  }

  private async getData(
    network: Network,
    blockNumber: number,
    dataType: DataType
  ) {
    const resp = await fetch(
      `${this.settings.dataUrl}/${network}/${dataType}/${blockNumber}`
    );

    return (await resp.json()).values;
  }

  private async getBlockNumberByTimestamp(
    network: Network,
    targetTimestamp: number
  ) {
    const provider = getProviderFromNetwork(network, true);
    let blockNumber = await provider.getBlockNumber();
    let block = await provider.getBlock(blockNumber);
    let requestsMade = 1;
    let highBlock;
    let lowBlock;

    while (true) {
      if (requestsMade > this.settings.maxProviderRequests) {
        throw Error(`Too many requests ${requestsMade}`);
      }
      if (highBlock && lowBlock) {
        if (
          block.timestamp === highBlock.timestamp ||
          block.timestamp == lowBlock.timestamp
        ) {
          const highDelta = highBlock.timestamp - targetTimestamp;
          const lowDelta = targetTimestamp - lowBlock.timestamp;
          block = highDelta < lowDelta ? highBlock : lowBlock;
          break;
        }
      }
      console.log(
        `blockNumber=${block.number},ts=${block.timestamp},target=${targetTimestamp}`
      );
      if (block.timestamp > targetTimestamp) {
        highBlock = block;
        const delta = Math.ceil(
          (block.timestamp - targetTimestamp) *
            this.settings.blocksPerSecond[network.toString()]
        );
        blockNumber -= delta;
        block = await provider.getBlock(blockNumber);
        requestsMade++;
      } else if (block.timestamp < targetTimestamp) {
        lowBlock = block;
        const delta = Math.ceil(
          (targetTimestamp - block.timestamp) *
            this.settings.blocksPerSecond[network.toString()]
        );
        blockNumber += delta;
        block = await provider.getBlock(blockNumber);
        requestsMade++;
      } else {
        break;
      }
    }

    console.log(`requestsMade=${requestsMade}`);

    return block.number;
  }

  public async views(network: Network) {
    return this.db
      .select()
      .from(DataService.WHITELISTED_VIEWS)
      .where('network_id', this.networkToId(network));
  }

  public async getView(network: Network, view: string, limit?: number) {
    const select = this.db
      .select()
      .from(`n${this.networkToId(network)}_${view}`);
    if (limit) {
      return select.limit(limit);
    }
    return select;
  }

  public async insertAccounts(network: Network, accountIds: string[]) {
    return this.db
      .insert(
        accountIds.map((id) => ({
          account_id: id,
          network_id: this.networkToId(network),
        }))
      )
      .into(DataService.ACCOUNTS_TABLE_NAME)
      .onConflict(['account_id', 'network_id'])
      .ignore();
  }

  public async insertVaultAccounts(
    network: Network,
    vaultAccounts: VaultAccount[]
  ) {
    return this.db
      .insert(
        vaultAccounts.map((va) => ({
          account_id: va.accountId,
          vault_id: va.vaultId,
          network_id: this.networkToId(network),
        }))
      )
      .into(DataService.VAULT_ACCOUNTS_TABLE_NAME)
      .onConflict(['account_id', 'vault_id', 'network_id'])
      .ignore();
  }

  public async accounts() {
    return this.db
      .select('account_id')
      .from(DataService.ACCOUNTS_TABLE_NAME)
      .where('network_id', this.networkToId(this.settings.network));
  }
}
