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
