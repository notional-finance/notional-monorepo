import { ServerRegistryConstructor } from '@notional-finance/core-entities/src/server';
import { BaseDO } from './base-do';
import { BaseDOEnv } from '.';
import { Network } from '@notional-finance/util';

export abstract class RegistryDO extends BaseDO<BaseDOEnv> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected registry: InstanceType<ServerRegistryConstructor<any>>;

  constructor(
    env: BaseDOEnv,
    serviceName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected RegistryClass: ServerRegistryConstructor<any>
  ) {
    super(env, serviceName);
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
          const timeoutPromise = new Promise<undefined>((_, reject) =>
            setTimeout(() => reject(undefined), timeoutDuration)
          );

          // Will reject after 5 seconds....
          const data = await Promise.race([refreshPromise, timeoutPromise]);

          // put the serialized data into the correct network storage key
          if (data) {
            const key = `${this.serviceName}/${network}`;
            await this.putStorageKey(key, data);

            console.log(
              `Completed Refresh on ${this.serviceName} for ${network}`
            );
          }
        })
      );
    } catch (error) {
      console.error(this.serviceName, error);
    }
  }
}
