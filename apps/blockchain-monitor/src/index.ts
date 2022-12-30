import { initLogger, log } from '@notional-finance/logging';
import { getJobs } from './monitors';
import { JobMonitorEnv, initializeProviders } from '@notional-finance/monitors';

export default {
  async fetch(): Promise<Response> {
    const response = new Response('OK', { status: 200 });
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
      try {
        ctx.waitUntil(
          await Promise.all(
            getJobs(env.NX_ENV)
              .get(controller.cron)
              .map((m) => m.run({ ctx, env }))
          )
        );
      } catch (e) {
        await log({
          message: (e as Error).message,
          level: 'error',
          action: 'blockchain_monitor.scheduled',
        });
      }
    }
  },
};
