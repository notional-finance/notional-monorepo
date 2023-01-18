import {
  MonitorJob,
  exchangeRateMonitorMainnet,
  kpiMonitorMainnet,
  MonitorSchedule,
} from '@notional-finance/monitors';

const jobs = {
  dev: new Map([
    [MonitorSchedule.EVERY_MINUTE, []],
    [
      MonitorSchedule.EVERY_15_MINUTES,
      [exchangeRateMonitorMainnet, kpiMonitorMainnet],
    ],
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
