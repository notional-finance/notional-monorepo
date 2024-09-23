import {
  IDataWriter,
  DataRow,
  DataContext,
  GenericDataConfig,
  TokenDataConfig,
} from './types';
import { Knex } from 'knex';

export class TokenBalanceDataWriter implements IDataWriter {
  public async write(db: Knex, context: DataContext, rows: DataRow[]) {
    const query = db
      .insert(
        rows.map((v) => {
          const dataConfig = v.dataConfig as TokenDataConfig;

          return {
            token_address: v.contractAddress,
            network: v.networkId,
            timestamp: context.timestamp,
            block_number: v.blockNumber,
            decimals: dataConfig.decimals,
            value: v.value?.toString(),
          };
        })
      )
      .into(context.tableName)
      .onConflict(['token_address', 'network', 'timestamp']);

    if (context.mergeConflicts) {
      return query.merge();
    }

    return query.ignore();
  }
}

export class GenericDataWriter implements IDataWriter {
  public async write(db: Knex, context: DataContext, rows: DataRow[]) {
    const query = db
      .insert(
        rows.map((v) => {
          const dataConfig = v.dataConfig as GenericDataConfig;

          return {
            strategy_id: dataConfig.strategyId,
            variable: dataConfig.variable,
            network: v.networkId,
            timestamp: context.timestamp,
            block_number: v.blockNumber,
            decimals: dataConfig.decimals,
            contract_address: v.contractAddress,
            method: v.method,
            latest_rate: v.value?.toString(),
          };
        })
      )
      .into(context.tableName)
      .onConflict(['strategy_id', 'variable', 'network', 'timestamp']);

    if (context.mergeConflicts) {
      return query.merge();
    }

    return query.ignore();
  }
}
