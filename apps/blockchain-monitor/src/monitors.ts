import { MonitorSchedule } from '@notional-finance/monitors';
import {
  MonitorJob,
  exchangeRateMonitorMainnet,
} from '@notional-finance/monitors';

export const monitors: Map<string, MonitorJob[]> = new Map([
  [MonitorSchedule.EVERY_MINUTE, [exchangeRateMonitorMainnet]],
  [MonitorSchedule.EVERY_15_MINUTES, []],
  [MonitorSchedule.EVERY_HOUR, []],
]);
