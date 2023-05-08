import { DurableObjectState } from '@cloudflare/workers-types';
import { ServerRegistryConstructor } from '@notional-finance/core-entities/src/server';
import { BaseDO } from './base-do';
import { BaseDOEnv } from '.';

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
    const network = url.searchParams.get('network');
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
  }

  override parseData(data: any) {
    return JSON.parse(data || '{}');
  }

  async onRefresh() {
    try {
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map(async (network) => {
          const intervalNum =
            (await this.state.storage.get<number>(`interval/${network}`)) || 0;

          // Call refresh on the registry for each network on its specified interval cadence
          await this.registry.refresh(network, intervalNum);
          // put the serialized data into the correct network storage key
          const data = this.registry.serializeToJSON(network);
          await this.state.storage.put(`${this.serviceName}/${network}`, data);

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
