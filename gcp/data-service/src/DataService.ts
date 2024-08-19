import { Knex } from 'knex';
import {
  Network,
  getProviderFromNetwork,
  ORACLE_TYPE_TO_ID,
  ONE_HOUR_MS,
  ACCOUNT_ID_RANGES,
} from '@notional-finance/util';
import { fetch } from 'cross-fetch';
import {
  buildOperations,
  defaultConfigDefs,
  defaultDataWriters,
  defaultGraphEndpoints,
  SUBGRAPH_API_KEY,
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
  VaultAPY,
  ProtocolName,
} from './types';
import { aggregate } from '@notional-finance/multicall';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  gql,
} from '@apollo/client/core';
import { graphQueries } from './graphQueries';
import { calculatePointsAccrued } from './RiskService';
import { Servers } from '@notional-finance/core-entities';

// TODO: fetch from DB
const networkToId = {
  all: 0,
  mainnet: 1,
  arbitrum: 2,
};

export type DataServiceSettings = {
  blocksPerSecond: Record<string, number>;
  maxProviderRequests: number;
  interval: number;
  frequency: number; // hourly, daily etc.
  dataUrl: string;
  mergeConflicts: boolean;
  backfillDelayMs: number;
};

export default class DataService {
  public static readonly TS_BN_MAPPINGS_TABLE_NAME = 'ts_bn_mappings';
  public static readonly ORACLE_DATA_TABLE_NAME = 'oracle_data';
  public static readonly ACCOUNTS_TABLE_NAME = 'accounts';
  public static readonly VAULT_ACCOUNTS_TABLE_NAME = 'vault_accounts';
  public static readonly VAULT_APY_NAME = 'vault_apy';
  public static readonly WHITELISTED_VIEWS = 'whitelisted_views';
  public static readonly POINTS_TABLE_NAME = 'arb_points';

  constructor(public db: Knex, public settings: DataServiceSettings) {}

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
        } else {
          throw Error(`Invalid backfill type ${type}`);
        }
      } catch (e: any) {
        console.error(`Failed to backfill ${ts}, ${e.toString()}`);
        console.error(e.stack);
      }
      await new Promise((r) => setTimeout(r, this.settings.backfillDelayMs));
    }
  }

  public async getBlockNumberFromTs(network: Network, ts: number) {
    if (network === Network.all) {
      network = Network.mainnet;
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
    // NOTE: this only ever syncs the all network data to get historical fiat token
    // exchange rates. Other networks are synced via the subgraph
    const networks = [Network.all];

    for (const network of networks) {
      const blockNumber = await this.getBlockNumberFromTs(network, ts);

      const server = new Servers.OracleRegistryServer({
        NX_SUBGRAPH_API_KEY: SUBGRAPH_API_KEY,
      });
      const values = await server.refreshAtBlock(network, blockNumber);

      if (values.length > 0) {
        const data = values
          .map((v) =>
            v[1]
              ? {
                  base: v[1].base,
                  quote: v[1].quote,
                  oracle_type: this.oracleTypeToId(v[1].oracleType),
                  network: this.networkToId(v[1].network),
                  timestamp: ts,
                  block_number: blockNumber,
                  decimals: v[1].decimals,
                  oracle_address: v[1].oracleAddress,
                  latest_rate: v[1].latestRate.rate.toString(),
                }
              : undefined
          )
          .filter((v) => v !== undefined);

        const query = this.db
          .insert(data)
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
    // TODO: need to catch on bad calls here...
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

  private getApolloClient(network: Network) {
    const endpoint = defaultGraphEndpoints()[ProtocolName.NotionalV3][network];
    if (!endpoint) {
      throw Error(`Subgraph endpoint not defined for network ${network}`);
    }
    return new ApolloClient({
      link: new HttpLink({
        uri: endpoint,
        fetch,
      }),
      cache: new InMemoryCache(),
    });
  }

  public async syncVaultAccounts(network: Network) {
    const client = this.getApolloClient(network);
    const size = 1000;
    let offset = 0;

    do {
      const resp = await client.query({
        query: gql(graphQueries.NotionalV3VaultAccounts),
        variables: {
          size: size,
          offset: offset,
        },
      });

      const balances = resp.data['balances'];
      if (balances.length === 0) {
        break;
      }

      await this.insertVaultAccounts(
        network,
        balances.map((b) => ({
          accountId: b.account.id,
          vaultId: b.token.vaultAddress,
        }))
      );

      offset += balances.length;
    } while (1);
  }

  public async syncAccounts(network: Network) {
    const client = this.getApolloClient(network);
    const size = 1000;

    for (let i = 0; i < ACCOUNT_ID_RANGES.length - 1; i++) {
      const startId = ACCOUNT_ID_RANGES[i];
      const endId = ACCOUNT_ID_RANGES[i + 1];
      let offset = 0;
      do {
        const resp = await client.query({
          query: gql(graphQueries.NotionalV3Accounts),
          variables: {
            size: size,
            offset: offset,
            startId: startId,
            endId: endId,
          },
        });

        const accounts = resp.data['accounts'];
        if (accounts.length === 0) {
          break;
        }

        await this.insertAccounts(
          network,
          accounts.map((a) => a.id)
        );

        offset += accounts.length;

        await new Promise((r) => setTimeout(r, this.settings.backfillDelayMs));
      } while (1);
    }
  }

  public async insertAccounts(network: Network, accountIds: string[]) {
    return this.db
      .insert(
        accountIds.map((id) => ({
          account_id: id.toLowerCase(),
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
          account_id: va.accountId.toLowerCase(),
          vault_id: va.vaultId.toLowerCase(),
          network_id: this.networkToId(network),
        }))
      )
      .into(DataService.VAULT_ACCOUNTS_TABLE_NAME)
      .onConflict(['account_id', 'vault_id', 'network_id'])
      .ignore();
  }

  public async insertPointsData(
    points: Awaited<ReturnType<typeof calculatePointsAccrued>>
  ) {
    return this.db
      .insert(points)
      .into(DataService.POINTS_TABLE_NAME)
      .onConflict(['account', 'date', 'token'])
      .ignore();
  }

  public async insertVaultAPY(network: Network, vaultAPY: VaultAPY[]) {
    return this.db
      .insert(
        vaultAPY.map((v) => ({
          network_id: this.networkToId(network),
          block_number: v.blockNumber,
          timestamp: v.timestamp,
          vault_address: v.vaultAddress,
          total_lp_tokens: v.totalLpTokens,
          lp_token_value_primary_borrow: v.lpTokenValuePrimaryBorrow,
          reward_token: v.rewardToken,
          reward_tokens_claimed: v.rewardTokensClaimed,
          reward_token_value_primary_borrow: v.rewardTokenValuePrimaryBorrow,
          no_vault_shares: v.noVaultShares,
          swap_fees: v.swapFees,
          symbol: v.rewardTokenSymbol,
        }))
      )
      .into(DataService.VAULT_APY_NAME)
      .onConflict(['network_id', 'timestamp', 'vault_address', 'reward_token'])
      .ignore();
  }

  public async accounts(network: Network) {
    return this.db
      .select('account_id')
      .from(DataService.ACCOUNTS_TABLE_NAME)
      .where('network_id', this.networkToId(network));
  }

  public async vaultAccounts(network: Network) {
    return this.db
      .select(['account_id', 'vault_id'])
      .from(DataService.VAULT_ACCOUNTS_TABLE_NAME)
      .where('network_id', this.networkToId(network));
  }

  public async readinessCheck() {
    return this.db
      .raw('SELECT 1')
      .then(() => true)
      .catch(() => false);
  }
}
