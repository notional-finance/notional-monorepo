import { initLogger } from '@notional-finance/logging';
import { getJobs } from './monitors';
import { JobMonitorEnv, initializeProviders } from '@notional-finance/monitors';

export default {
  async fetch(
    request: Request,
    env: JobMonitorEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    const id = env.EXCHANGE_RATE_STORE.idFromName(
      new URL(request.url).pathname
    );
    const stub = env.EXCHANGE_RATE_STORE.get(id);
    const response = await stub.fetch(request);
    return response;
  },

  async scheduled(
    controller: ScheduledController,
    env: JobMonitorEnv,
    ctx: ExecutionContext
  ): Promise<void> {
    const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
    initLogger({
      service: 'blockchain-monitor',
      version,
      env: env.NX_ENV,
      apiKey: env.NX_DD_API_KEY,
    });
    initializeProviders(env.ALCHEMY_KEY);

    if (getJobs(env.NX_ENV).has(controller.cron)) {
      ctx.waitUntil(
        await Promise.all(
          getJobs(env.NX_ENV)
            .get(controller.cron)
            .map((m) => m.run({ ctx, env }))
        )
      );
    }
  },
};
