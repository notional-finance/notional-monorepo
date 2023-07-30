import { DurableObjectState } from '@cloudflare/workers-types';
import { ServerRegistryConstructor } from '@notional-finance/core-entities/src/server';
import { BaseDO } from './base-do';
import { BaseDOEnv } from '.';
import zlib from 'zlib';
import { Network } from '@notional-finance/util';

export abstract class RegistryDO extends BaseDO<BaseDOEnv> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected registry: InstanceType<ServerRegistryConstructor<any>>;

  constructor(
    state: DurableObjectState,
    env: BaseDOEnv,
    alarmCadenceMS: number,
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected RegistryClass: ServerRegistryConstructor<any>
  ) {
    super(state, env, serviceName, alarmCadenceMS);
    this.registry = new RegistryClass();
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
  }

  override async parseData(data: string) {
    try {
      const unzipped = await new Promise<string>((resolve, reject) => {
        zlib.unzip(Buffer.from(data, 'base64'), (err, result) => {
          if (err) reject(err);
          resolve(result.toString('utf-8'));
        });
      });
      return JSON.parse(unzipped.toString() || '{}');
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  async onRefresh() {
    try {
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map(async (network) => {
          if (network === Network.All && !this.registry.hasAllNetwork()) return;

          // Call refresh on the registry for each network on its specified interval cadence
          await this.registry.refresh(network);
          // put the serialized data into the correct network storage key
          const data = this.registry.serializeToJSON(network);
          const gz = await new Promise<string>((resolve, reject) => {
            zlib.gzip(Buffer.from(data, 'utf-8'), (err, result) => {
              if (err) reject(err);
              resolve(result.toString('base64'));
            });
          });

          await this.state.storage.put(`${this.serviceName}/${network}`, gz);
          this.logger.log({
            level: 'debug',
            message: `Completed Refresh for ${network}`,
          });
        })
      );
    } catch (error) {
      console.log(this.serviceName, error);
      this.logger.log({
        level: 'error',
        message: (error as Error).toString(),
      });
    }
  }
}
