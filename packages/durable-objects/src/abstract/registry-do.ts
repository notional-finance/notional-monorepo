import { DurableObjectState } from '@cloudflare/workers-types';
import { ServerRegistryConstructor } from '@notional-finance/core-entities/src/server';
import { BaseDO } from './base-do';
import { BaseDOEnv } from '.';
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

  async onRefresh() {
    try {
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map(async (network) => {
          if (network === Network.All && !this.registry.hasAllNetwork()) return;

          // Call refresh on the registry for each network on its specified interval cadence
          await this.registry.refresh(network);
          // put the serialized data into the correct network storage key
          const data = this.registry.serializeToJSON(network);
          const key = `${this.serviceName}/${network}`;
          await this.putStorageKey(key, data);

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
