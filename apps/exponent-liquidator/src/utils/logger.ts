export function logDebug(
  step: string,
  context?: Record<string, unknown>,
  logLevel?: string
): void {
  if (logLevel !== 'debug') return;

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'exponent-liquidator',
      level: 'debug',
      step,
      ...(context && { context }),
    })
  );
}

export function logInfo(step: string, context?: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'exponent-liquidator',
      level: 'info',
      step,
      ...(context && { context }),
    })
  );
}

export function logError(
  step: string,
  error: Error,
  context?: Record<string, unknown>
): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'exponent-liquidator',
      level: 'error',
      step,
      error: error.message,
      stack: error.stack,
      ...(context && { context }),
    })
  );
}
