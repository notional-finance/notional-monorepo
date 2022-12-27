import { initLogger } from '@notional-finance/logging';
import { monitors } from './monitors';
import { JobMonitorEnv } from '@notional-finance/monitors';

export default {
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

    if (monitors.has(controller.cron)) {
      ctx.waitUntil(
        await Promise.all(
          monitors.get(controller.cron).map((m) => m.run({ ctx, env }))
        )
      );
    }
  },
};
