import { logError } from '@notional-finance/util';
import { useEffect, useState } from 'react';
interface GeoIpResponse {
  country: string;
}

const vpnCheck = 'http://detect.notional.finance/';
const dataURL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';
const env = process.env['NODE_ENV'];
// https://orpa.princeton.edu/export-controls/sanctioned-countries
// const BlockedRegions = [
//   'US', Cuba, Iran, Iraq, Syria, North Korea, Russia, Belarus,
//   Central African Republic, Congo, Lebanon, Liberia, Libya,
//   Somalia, Venezuela, Yemen, Zimbabwe
// ]
// Sanctions oracle...
// https://etherscan.io/address/0x40c57923924b5c5c5455c48d93317139addac8fb

export function useGeoipBlock() {
  const [country, setCountry] = useState<string>('N/A');
  const isProd = env === 'production';

  useEffect(() => {
    const fetchIPBlock = async () => {
      const resp: GeoIpResponse = await (
        await fetch(`${dataURL}/geoip`)
      ).json();
      const vpnResp = await fetch(vpnCheck);
      if (vpnResp.status !== 200) setCountry('VPN');
      else setCountry(resp.country);
    };

    fetchIPBlock().catch((e) => {
      logError(e as Error, 'leveraged-vaults', 'use-geoip-block');
    });
  }, []);

  return isProd
    ? country === 'N/A' || country === 'US' || country === 'VPN'
    : false;
}
