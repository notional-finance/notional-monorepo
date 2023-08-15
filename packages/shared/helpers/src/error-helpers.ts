import { datadogRum } from '@datadog/browser-rum';
import { useEffect, useState } from 'react';
import { IS_LOCAL_ENV } from '@notional-finance/util';

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
  if (IS_LOCAL_ENV) {
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

interface GeoIpResponse {
  country: string;
}

const dataURL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';
const env = process.env['NODE_ENV'];

export function useGeoipBlock() {
  const [country, setCountry] = useState<string>('N/A');
  const isProd = env === 'production';

  useEffect(() => {
    fetch(`${dataURL}/geoip`)
      .then((v) => {
        return v.json() as Promise<GeoIpResponse>;
      })
      .then((r) => {
        setCountry(r.country);
      })
      .catch((e) => {
        logError(e as Error, 'leveraged-vaults', 'use-geoip-block');
      });
  }, []);

  return isProd ? country === 'N/A' || country === 'US' : false;
}
