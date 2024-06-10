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
    alarmCadenceMS: number | undefined,
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected RegistryClass: ServerRegistryConstructor<any>
  ) {
    super(state, env, serviceName, alarmCadenceMS);
    this.registry = new RegistryClass(env);
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
  }

  async onRefresh() {
    const timeoutDuration = 55_000;

    try {
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map(async (network) => {
          if (network === Network.all && !this.registry.hasAllNetwork()) return;

          // Wrap each promise with a timeout
          const refreshPromise = this.registry.refresh(network);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Timeout for ${network}`)),
              timeoutDuration
            )
          );

          // Will reject after 5 seconds....
          await Promise.race([refreshPromise, timeoutPromise]);

          // put the serialized data into the correct network storage key
          const data = this.registry.serializeToJSON(network);
          const key = `${this.serviceName}/${network}`;
          await this.putStorageKey(key, data);

          console.log(
            `Completed Refresh on ${this.serviceName} for ${network}`
          );
        })
      );
    } catch (error) {
      console.error(this.serviceName, error);
    }
  }
}
