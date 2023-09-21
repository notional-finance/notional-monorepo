import { logError } from '@notional-finance/util';
import { useEffect, useState } from 'react';
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
