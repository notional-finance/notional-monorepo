import { initMetricLogger } from '@notional-finance/logging';
import { getJobs } from './monitors';
import { JobMonitorEnv, initializeProviders } from '@notional-finance/monitors';
import { KPIsDO } from '@notional-finance/durable-objects';
export { KPIsDO };

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
    initMetricLogger({
      apiKey: env.NX_DD_API_KEY,
    });
    initializeProviders(env.ALCHEMY_KEY);

    if (getJobs(env.NX_ENV).has(controller.cron)) {
      try {
        ctx.waitUntil(
          Promise.all(
            getJobs(env.NX_ENV)
              .get(controller.cron)
              .map((m) => m.run({ ctx, env }))
          ).then(() => {
            return;
          })
        );
      } catch (e) {
        console.log('Error running scheduled job', e);
      }
    }
  },
};
