import ethers, { BigNumber } from 'ethers';
import { Knex } from 'knex';
import { Network } from '@notional-finance/util';
import { fetch } from 'cross-fetch';
import { URLSearchParams } from 'url';

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
  blocksPerSecond: number;
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

  public async backfill(startTime: number, endTime: number) {
    startTime = this.intervalTimestamp(startTime);
    endTime = this.intervalTimestamp(endTime);
    if (startTime === endTime) {
      return;
    }
    const timestamps: number[] = [];
    while (startTime < endTime) {
      timestamps.push(startTime);
      startTime += this.settings.interval * this.settings.frequency;
    }
    await Promise.all(timestamps.map((ts) => this.sync(ts)));
  }

  public async sync(ts: number) {
    ts = this.intervalTimestamp(ts);
    // get blockNumber by timestamp
    const record = await this.db
      .select()
      .from(DataService.TS_BN_MAPPINGS_TABLE_NAME)
      .where('timestamp', ts);
    let blockNumber = 0;
    if (record.length === 0) {
      blockNumber = await this.getBlockNumberByTimestamp(ts);
      await this.db
        .insert([
          {
            timestamp: ts,
            block_number: blockNumber,
          },
        ])
        .into(DataService.TS_BN_MAPPINGS_TABLE_NAME);
    } else {
      blockNumber = record[0].block_number as number;
    }

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

  public async getBlockNumberByTimestamp(targetTimestamp: number) {
    let blockNumber = await this.provider.getBlockNumber();
    let block = await this.provider.getBlock(blockNumber);
    let requestsMade = 1;

    while (true) {
      if (requestsMade > this.settings.maxProviderRequests) {
        break;
      }
      console.log(`blockNumber=${block.number},ts=${block.timestamp}`);
      if (block.timestamp > targetTimestamp) {
        const delta = Math.round(
          (block.timestamp - targetTimestamp) * this.settings.blocksPerSecond
        );
        blockNumber -= delta;
        block = await this.provider.getBlock(blockNumber);
        requestsMade++;
      } else if (block.timestamp < targetTimestamp) {
        const delta = Math.round(
          (targetTimestamp - block.timestamp) * this.settings.blocksPerSecond
        );
        blockNumber += delta;
        block = await this.provider.getBlock(blockNumber);
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
}
