import { DurableObjectState } from '@cloudflare/workers-types';
import { ServerRegistryConstructor } from '@notional-finance/core-entities';
import { BaseDO } from './base-do';
import { BaseDOEnv } from '.';
import { Network } from '@notional-finance/util';

export abstract class RegistryDO extends BaseDO<BaseDOEnv> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected registry: InstanceType<ServerRegistryConstructor<any>>;

  constructor(
    state: DurableObjectState,
    env: BaseDOEnv,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected RegistryClass: ServerRegistryConstructor<any>
  ) {
    super(state, env);
    this.registry = new RegistryClass();
  }

  isValidPath(path: string): boolean {
    return path === '/' + this.env.SERVICE_NAME;
  }

  getStorageKey(url: URL): string {
    const network = url.searchParams.get('network');
    if (!network) throw Error('Network Not Found');
    return network;
  }

  async onRefresh() {
    try {
      await Promise.all(
        (Object.keys(Network) as Network[]).map(async (network) => {
          const intervalNum =
            (await this.state.storage.get<number>(`interval/${network}`)) || 0;

          // Call refresh on the registry for each network on its specified interval cadence
          await this.registry.refresh(network, intervalNum);
          // put the serialized data into the correct network storage key
          await this.state.storage.put(
            `${this.env.SERVICE_NAME}/${network}`,
            this.registry.serializeToJSON(network)
          );

          await this.state.storage.put(`interval/${network}`, intervalNum + 1);
          this.logger.log({
            level: 'debug',
            message: `Completed Refresh for ${network} at interval: ${intervalNum}`,
          });
        })
      );
    } catch (error) {
      this.logger.log({
        level: 'error',
        message: (error as Error).toString(),
      });
    }
  }
}
