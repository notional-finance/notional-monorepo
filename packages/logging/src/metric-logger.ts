import { DDSeries, MetricLoggerOptions } from './types';

const DefaultConfig = {
  url: `https://api.datadoghq.com/api/v2/series`,
};

let config: MetricLoggerOptions;

export function initMetricLogger(opts: MetricLoggerOptions) {
  const { apiKey, url } = opts;
  config = {
    ...DefaultConfig,
    url,
    apiKey,
  };
}

export async function submitMetrics(series: DDSeries) {
  try {
    const body = JSON.stringify({ series });
    const opts = {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'dd-api-key': config.apiKey,
      },
    };

    await fetch(config.url ?? DefaultConfig.url, opts);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
