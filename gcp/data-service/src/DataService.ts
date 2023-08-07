import ethers, { BigNumber } from 'ethers';
import { Knex } from 'knex';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
import { fetch } from 'cross-fetch';
import { URLSearchParams } from 'url';
import {
  buildOperations,
  defaultConfigDefs,
  defaultDataWriters,
} from './config';
import {
  BackfillType,
  DataRow,
  MulticallConfig,
  MulticallOperation,
  SubgraphConfig,
  SubgraphOperation,
  TableName,
  VaultAccount,
} from './types';
import { aggregate } from '@notional-finance/multicall';
import { ApolloClient, InMemoryCache } from '@apollo/client';

// TODO: fetch from DB
const networkToId = {
  mainnet: 1,
  arbitrum: 2,
};

// TODO: fetch from DB
const oracleTypeToId = {
  Chainlink: 1,
  VaultShareOracleRate: 2,
  fCashOracleRate: 3,
  nTokenToUnderlyingExchangeRate: 4,
  fCashToUnderlyingExchangeRate: 5,
  fCashSettlementRate: 6,
};

export type DataServiceSettings = {
  network: Network;
  blocksPerSecond: Record<string, number>;
  maxProviderRequests: number;
  interval: number;
  frequency: number; // hourly, daily etc.
  startingBlock: number;
  registryUrl: string;
};

export default class DataService {
  public static readonly REGISTER_TYPE = 'oracles';
  public static readonly TS_BN_MAPPINGS_TABLE_NAME = 'ts_bn_mappings';
  public static readonly ORACLE_DATA_TABLE_NAME = 'oracle_data';
  public static readonly ACCOUNTS_TABLE_NAME = 'accounts';
  public static readonly VAULT_ACCOUNTS_TABLE_NAME = 'vault_accounts';

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
    return oracleTypeToId[oracleType];
  }

  public idToOracleType(id: number) {
    return this.getKeyByValue(oracleTypeToId, id);
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
    if (type === BackfillType.GenericData) {
      await Promise.all(timestamps.map((ts) => this.syncGenericData(ts)));
    } else if (type === BackfillType.OracleData) {
      await Promise.all(timestamps.map((ts) => this.syncOracleData(ts)));
    } else {
      throw Error(`Invalid backfill type ${type}`);
    }
  }

  private async getBlockNumberFromTs(network: Network, ts: number) {
    ts = this.intervalTimestamp(ts);
    // get blockNumber by timestamp
    const record = await this.db
      .select()
      .from(DataService.TS_BN_MAPPINGS_TABLE_NAME)
      .where('timestamp', ts)
      .andWhere('network_id', this.networkToId(network));
    let blockNumber = 0;
    if (record.length === 0) {
      blockNumber = await this.getBlockNumberByTimestamp(network, ts);
      await this.db
        .insert([
          {
            timestamp: ts,
            block_number: blockNumber,
            network_id: this.networkToId(network),
          },
        ])
        .into(DataService.TS_BN_MAPPINGS_TABLE_NAME);
    } else {
      blockNumber = parseInt(record[0].block_number);
    }

    return blockNumber;
  }

  public async syncOracleData(ts: number) {
    const blockNumber = await this.getBlockNumberFromTs(
      this.settings.network,
      ts
    );

    // Get data using block number
    if (blockNumber < this.settings.startingBlock) {
      // too old
      return;
    }

    const data = await this.getRegistryData(blockNumber);

    // Store data in DB
    const values = data.filter(
      (d) =>
        this.oracleTypeToId(d[1].oracleType) && this.networkToId(d[1].network)
    );

    await this.db
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
      .onConflict(['base', 'quote', 'oracle_type', 'network', 'timestamp'])
      .ignore();

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
    const calls = operations.map((op) => op.aggregateCall);
    const response = await aggregate(calls, provider, blockNumber, true);

    operations.forEach((op) => {
      let values = dbData.get(op.configDef.tableName);
      if (!values) {
        values = [];
        dbData.set(op.configDef.tableName, values);
      }
      const sourceConfig = op.configDef.sourceConfig as MulticallConfig;
      const key = op.aggregateCall.key as string;
      values.push({
        strategyId: op.configDef.strategyId,
        variable: op.configDef.variable,
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
          uri: op.endpoint,
          cache: new InMemoryCache(),
        });

        const sourceConfig = op.configDef.sourceConfig as SubgraphConfig;
        return client.query({
          query: op.subgraphQuery,
          variables: {
            ts: ts,
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
        strategyId: op.configDef.strategyId,
        variable: op.configDef.variable,
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
      Array.from(operations.aggregateCalls.keys()).map((network) => {
        return this.syncFromMulticall(
          dbData,
          network,
          ts,
          operations.aggregateCalls.get(network) || []
        );
      })
    );

    await Promise.all(
      Array.from(operations.subgraphCalls.keys()).map((network) => {
        return this.syncFromSubgraph(
          dbData,
          network,
          ts,
          operations.subgraphCalls.get(network) || []
        );
      })
    );

    return Promise.all(
      Array.from(dbData.keys()).map((k) => {
        defaultDataWriters[k].write(
          this.db,
          {
            tableName: k,
            timestamp: ts,
          },
          dbData.get(k) || []
        );
      })
    );
  }

  private async getRegistryData(blockNumber: number) {
    const resp = await fetch(
      `${this.settings.registryUrl}/${DataService.REGISTER_TYPE}?` +
        new URLSearchParams({
          network: this.settings.network,
          blockNumber: blockNumber.toString(),
        })
    );

    return (await resp.json()).values;
  }

  public async getBlockNumberByTimestamp(
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
        break;
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

  public async query() {
    return this.db.select().from(DataService.ORACLE_DATA_TABLE_NAME);
  }

  public async insertAccounts(accountIds: string[]) {
    return this.db
      .insert(
        accountIds.map((id) => ({
          account_id: id,
          network_id: this.networkToId(this.settings.network),
        }))
      )
      .into(DataService.ACCOUNTS_TABLE_NAME)
      .onConflict(['account_id', 'network_id'])
      .ignore();
  }

  public async insertVaultAccounts(vaultAccounts: VaultAccount[]) {
    return this.db
      .insert(
        vaultAccounts.map((va) => ({
          account_id: va.accountId,
          vault_id: va.vaultId,
          network_id: this.networkToId(this.settings.network),
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
