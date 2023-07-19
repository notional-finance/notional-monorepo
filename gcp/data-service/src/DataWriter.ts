import { BigNumber } from 'ethers';
import { IDataWriter, DataRow, DataContext } from './types';
import { Knex } from 'knex';

export class GenericDataWriter implements IDataWriter {
  public async write(
    db: Knex,
    context: DataContext,
    rows: DataRow[]
  ): Promise<void> {
    await db
      .insert(
        rows.map((v) => ({
          id: v.id,
          network: context.networkId,
          timestamp: context.timestamp,
          block_number: context.blockNumber,
          decimals: v.dataConfig.decimals,
          latest_rate: BigNumber.from(v.value).toString(),
        }))
      )
      .into(context.tableName)
      .onConflict(['id', 'network', 'timestamp'])
      .ignore();
  }
}
