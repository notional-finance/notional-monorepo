import ethers from 'ethers';
import { Knex } from 'knex';

export type DataServiceSettings = {
  blocksPerSecond: number;
  maxProviderRequests: number;
  interval: number;
  frequency: number; // hourly, daily etc.
};

export default class DataService {
  public static readonly TS_BN_MAPPINGS_TABLE_NAME = 'ts_bn_mappings';
  constructor(
    public provider: ethers.providers.Provider,
    public db: Knex,
    public settings: DataServiceSettings
  ) {}

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

    // Store data in DB

    return blockNumber;
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
}
