import { MonitorSchedule } from '@notional-finance/monitors';
import { MonitorJob, exchangeRateMonitor } from '@notional-finance/monitors';

export const monitors: Map<string, MonitorJob[]> = new Map([
  [MonitorSchedule.EVERY_MINUTE, [exchangeRateMonitor]],
  [MonitorSchedule.EVERY_15_MINUTES, []],
  [MonitorSchedule.EVERY_HOUR, []],
]);
