import { LoggerOptions, LogMessage } from './types';

const DefaultLoggerConfig = {
  url: `https://http-intake.logs.datadoghq.com/api/v2/logs`,
};

const MessageDefaults = {
  level: 'info',
  ddsource: 'nodejs',
  message: '',
};

export class Logger {
  baseMessage: LogMessage;
  loggerConfig: LoggerOptions;

  constructor(opts: LoggerOptions) {
    const { service, version, env, apiKey, url } = opts;
    this.loggerConfig = {
      url,
      apiKey,
      service,
      version,
      env,
    };

    this.baseMessage = {
      ...MessageDefaults,
      service,
      version,
      env,
    };
  }

  async log(msg: LogMessage) {
    try {
      const timestamp = new Date();
      const body = JSON.stringify({
        ...this.baseMessage,
        ...msg,
        timestamp,
      });

      const opts = {
        method: 'POST',
        body,
        headers: {
          'Content-Encoding': 'gzip',
          'Content-Type': 'application/json',
          'dd-api-key': this.loggerConfig.apiKey,
        },
      };

      await fetch(this.loggerConfig.url ?? DefaultLoggerConfig.url, opts);
    } catch (e) {
      console.error(e);
    }
  }
}
