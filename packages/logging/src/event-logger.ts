import { DDEvent, EventLoggerOptions } from './types';

const DefaultConfig = {
  url: `https://api.datadoghq.com/api/v2/events`,
};

let config: EventLoggerOptions;

export function initEventLogger(opts: EventLoggerOptions) {
  const { apiKey, url } = opts;
  config = {
    ...DefaultConfig,
    url,
    apiKey,
  };
}

export async function submitEvent(event: DDEvent) {
  try {
    const body = JSON.stringify(event);
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
  }
}
