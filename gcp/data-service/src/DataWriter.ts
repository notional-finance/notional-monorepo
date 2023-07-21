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
          network: v.networkId,
          timestamp: context.timestamp,
          block_number: v.blockNumber,
          decimals: v.dataConfig.decimals,
          contract_address: v.contractAddress,
          method: v.method,
          latest_rate: BigNumber.from(v.value).toString(),
        }))
      )
      .into(context.tableName)
      .onConflict(['id', 'network', 'timestamp'])
      .ignore();
  }
}
