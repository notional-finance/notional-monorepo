import {
  MonitorJob,
  exchangeRateMonitorMainnet,
  kpiMonitorMainnet,
  MonitorSchedule,
} from '@notional-finance/monitors';

const jobs = {
  dev: new Map([
    [MonitorSchedule.EVERY_MINUTE, []],
    [MonitorSchedule.EVERY_15_MINUTES, [exchangeRateMonitorMainnet]],
    [MonitorSchedule.EVERY_HOUR, [kpiMonitorMainnet]],
  ]),
  prod: new Map([
    [MonitorSchedule.EVERY_MINUTE, [exchangeRateMonitorMainnet]],
    [MonitorSchedule.EVERY_15_MINUTES, []],
    [MonitorSchedule.EVERY_HOUR, [kpiMonitorMainnet]],
  ]),
};
export function getJobs(env: string): Map<string, MonitorJob[]> {
  return jobs[env];
}
