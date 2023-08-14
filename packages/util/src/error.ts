import { datadogRum } from '@datadog/browser-rum';

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
  context: Record<string, unknown> = {}
) {
  if (
    process.env['NODE_ENV'] === 'development' ||
    process.env['NODE_ENV'] === 'test'
  ) {
    // Don't log to datadog from local
    /* eslint-disable no-console */
    console.error(`Error at: ${module}#${method}`);
    console.error(error);
    console.error(context);
    /* eslint-enable no-console */
  } else {
    if (error instanceof NonLoggedError) return;
    datadogRum.addError(error, {
      module,
      method,
      ...context,
    });
  }
}
