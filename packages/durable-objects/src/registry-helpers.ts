import { ServerRegistryConstructor } from '@notional-finance/core-entities';
import { BaseDOEnv } from '.';
import { Network } from '@notional-finance/util';
import { createLogger } from './logger';

export async function putStorageKey(env: BaseDOEnv, key: string, data: string) {
  await env.VIEW_CACHE_R2.put(key, data);
}

export async function refreshRegistry<T>(
  env: BaseDOEnv,
  serviceName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  RegistryClass: ServerRegistryConstructor<T>,
  timeoutDurationMS = 55_000
) {
  const registry = new RegistryClass(env);

  try {
    await Promise.all(
      env.SUPPORTED_NETWORKS.map(async (network) => {
        if (network === Network.all && !registry.hasAllNetwork()) return;

        // Wrap each promise with a timeout
        const refreshPromise = registry.refresh(network);
        const timeoutPromise = new Promise<undefined>((_, reject) =>
          setTimeout(() => reject(undefined), timeoutDurationMS)
        );

        // Will reject after timeoutDuration....
        const data = await Promise.race([refreshPromise, timeoutPromise]);

        // put the serialized data into the correct network storage key
        if (data) {
          const key = `${network}/${serviceName}`;
          await putStorageKey(env, key, data);

          console.log(`Completed Refresh on ${serviceName} for ${network}`);
        } else {
          console.error(`Refresh on ${serviceName} for ${network} timed out`);
          const logger = createLogger(env, serviceName);
          await logger.submitEvent({
            aggregation_key: 'RegistryTimeout',
            alert_type: 'warning',
            host: 'cloudflare',
            network: network,
            title: `${serviceName} Refresh Timeout`,
            tags: [`service:${serviceName}`],
            text: `Refresh on ${serviceName} for ${network} timed out after ${timeoutDurationMS}ms`,
          });
        }
      })
    );
  } catch (error) {
    console.error(serviceName, error);
  }
}
