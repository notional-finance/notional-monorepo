import { datadogRum } from '@datadog/browser-rum';
import { IS_LOCAL_ENV } from './constants';

// Errors of this type are not logged to data dog to reduce noise
export class NonLoggedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export function logError(
  error: Error | NonLoggedError,
  module: string,
  method: string,
  context: Record<string, unknown> = {},
  logToConsole = false
) {
  const appUrl = process.env['NX_APP_URL'] as string;

  if (IS_LOCAL_ENV) {
    // Don't log to datadog from local
    /* eslint-disable no-console */
    console.error(`Error at: ${module}#${method}`);
    console.error(error);
    console.error({ context });
    /* eslint-enable no-console */
  } else {
    if (error instanceof NonLoggedError) return;
    if (logToConsole) console.error(error);

    if (!appUrl.includes('localhost') && !appUrl.includes('dev')) {
      datadogRum.addError(
        {
          source: `${module}#${method}`,
          type: method,
          message: error.message,
        },
        {
          module,
          method,
          ...context,
        }
      );
    }
  }
}
