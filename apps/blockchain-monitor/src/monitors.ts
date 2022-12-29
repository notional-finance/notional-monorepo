import { MonitorSchedule } from '@notional-finance/monitors';
import {
  MonitorJob,
  exchangeRateMonitorMainnet,
} from '@notional-finance/monitors';

const jobs = {
  local: new Map([
    [MonitorSchedule.EVERY_MINUTE, [exchangeRateMonitorMainnet]],
    [MonitorSchedule.EVERY_15_MINUTES, []],
    [MonitorSchedule.EVERY_HOUR, []],
  ]),
  dev: new Map([
    [MonitorSchedule.EVERY_MINUTE, []],
    [MonitorSchedule.EVERY_15_MINUTES, [exchangeRateMonitorMainnet]],
    [MonitorSchedule.EVERY_HOUR, []],
  ]),
  prod: new Map([
    [MonitorSchedule.EVERY_MINUTE, [exchangeRateMonitorMainnet]],
    [MonitorSchedule.EVERY_15_MINUTES, []],
    [MonitorSchedule.EVERY_HOUR, []],
  ]),
};
export function getJobs(env: string): Map<string, MonitorJob[]> {
  return jobs[env];
}
