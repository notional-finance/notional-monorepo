import { logError } from '@notional-finance/util';
import { useEffect, useState } from 'react';
interface GeoIpResponse {
  country: string;
}

const vpnCheck = 'http://balancer-234389748.us-east-2.elb.amazonaws.com/';
const dataURL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';
const env = process.env['NODE_ENV'];

export function useGeoipBlock() {
  const [country, setCountry] = useState<string>('N/A');
  const isProd = env === 'production';

  useEffect(() => {
    const fetchIPBlock = async () => {
      const country: GeoIpResponse = await (
        await fetch(`${dataURL}/geoip`)
      ).json();
      const vpnResp = await fetch(vpnCheck);
      if (vpnResp.status !== 200) setCountry('VPN');
      else setCountry(country.country);
    };

    fetchIPBlock().catch((e) => {
      logError(e as Error, 'leveraged-vaults', 'use-geoip-block');
    });
  }, []);

  return isProd
    ? country === 'N/A' || country === 'US' || country === 'VPN'
    : false;
}
