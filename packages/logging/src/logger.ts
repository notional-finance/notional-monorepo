import {
  createLogger as createWinstonLogger,
  transports,
  format,
  Logger,
} from 'winston';
import { LoggerOptions, LogMessage } from './types';

const DefaultLoggerOptions = {
  host: `http-intake.logs.datadoghq.com`,
  path: `/api/v2/logs?dd-api-key=`,
  ssl: true,
};

let logger: Logger;

export function createLogger(opts: LoggerOptions): Logger {
  const { host, path, ssl } = DefaultLoggerOptions;
  const { service, version, env, apiKey } = opts;
  logger = createWinstonLogger({
    transports: [
      new transports.Http({
        host,
        path: `${path}${apiKey}`,
        ssl,
      }),
    ],
    defaultMeta: { ddsource: 'nodejs', service, env, version },
    format: format.combine(format.timestamp(), format.json()),
  });
  return logger;
}

export function log(msg: LogMessage) {
  const { level, message, chain, tags, ...rest } = msg;
  logger.log(level ?? 'info', {
    message,
    chain: chain ?? '',
    tags: tags ?? '',
    ...rest,
  });
}
