import { useNotional } from '@notional-finance/notionable-hooks';
import { logError, networkName } from '@notional-finance/helpers';
import { useEffect, useState } from 'react';

interface GeoIpResponse {
  country: string;
}

const dataURL =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance.finance';

export function useGeoipBlock() {
  const { connectedChain } = useNotional();
  const [country, setCountry] = useState<string>('N/A');

  // Testnet is allowed to be used by anyone
  const isBlockableNetwork = networkName(connectedChain) !== 'goerli';

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

  return isBlockableNetwork ? country === 'N/A' || country === 'US' : false;
}
