export type LoggerOptions = {
  service: string;
  version: string;
  apiKey: string;
  env?: string;
  url?: string;
};

export type LogMessage = {
  message: string;
  level?: string;
  service?: string;
  tags?: string;
  chain?: string;
  [key: string]: unknown;
};

export type MetricLoggerOptions = {
  apiKey: string;
  url?: string;
};

export type DDMetric = {
  name: string;
  value: number;
  tags: string[];
  timestamp: number;
};

export type DDSeries = {
  series: DDMetric[];
};

export type EventLoggerOptions = {
  apiKey: string;
  url?: string;
};

export enum DDEventKey {
  GeoIPLog = 'GeoIPLog',
}

export enum DDEventAlertType {
  error = 'error',
  warning = 'warning',
  info = 'info',
}

export type DDEvent = {
  aggregation_key: DDEventKey;
  alert_type: DDEventAlertType;
  title: string;
  tags: string[];
  text: string;
};
