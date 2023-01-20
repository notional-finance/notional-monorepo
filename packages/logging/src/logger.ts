import { LoggerOptions, LogMessage } from './types';

const DefaultLoggerConfig = {
  url: `https://http-intake.logs.datadoghq.com/api/v2/logs`,
};

const MessageDefaults = {
  level: 'info',
  ddsource: 'nodejs',
  message: '',
};

let baseMessage: LogMessage;
let loggerConfig: LoggerOptions;

export function initLogger(opts: LoggerOptions) {
  const { service, version, env, apiKey, url } = opts;
  loggerConfig = {
    url,
    apiKey,
    service,
    version,
    env,
  };

  baseMessage = {
    ...MessageDefaults,
    service,
    version,
    env,
  };
}

export async function log(msg: LogMessage) {
  try {
    const timestamp = new Date();
    const body = JSON.stringify({
      ...baseMessage,
      ...msg,
      timestamp,
    });

    const opts = {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'dd-api-key': loggerConfig.apiKey,
      },
    };

    await fetch(loggerConfig.url ?? DefaultLoggerConfig.url, opts);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
