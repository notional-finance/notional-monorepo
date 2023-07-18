import { IDataWriter } from './types';
import { Knex } from 'knex';

export class GenericDataWriter implements IDataWriter {
  public async write(db: Knex): Promise<void> {
    console.log(db.VERSION);
  }
}
