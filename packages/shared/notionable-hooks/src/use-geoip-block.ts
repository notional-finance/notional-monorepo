import { useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { isTestHost } from '@notional-finance/util';
import { useWalletStore } from './context/use-root-store';

const env = process.env['NODE_ENV'];
// https://orpa.princeton.edu/export-controls/sanctioned-countries
const SanctionedCountries = [
  'CU', // Cuba
  'IR', // Iran
  'IQ', // Iraq
  'SY', // Syria
  'KP', // North Korea
  'RU', // Russia
  'BY', // Belarus
  'CF', // Central African Republic
  'CD', // Democratic Republic of the Congo
  'CG', // Congo
  'LB', // Lebanon
  'LR', // Liberia
  'LY', // Libya
  'SO', // Somalia
  'VE', // Venezuela
  'YE', // Yemen
  'ZW', // Zimbabwe
  'US', // United States(blocked for leverage usage)
];

export function useSanctionsBlock() {
  const walletStore = useWalletStore();
  const country = walletStore.country;
  const isSanctionedAddress = walletStore.isSanctionedAddress;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isProd = env === 'production' && !isTestHost();

  const isSanctioned =
    SanctionedCountries.find((s) => s === country) || isSanctionedAddress;
  useEffect(() => {
    if (isProd && isSanctioned && pathname !== 'error') {
      navigate('/blocked');
    }
  }, [navigate, pathname, isSanctioned]);
}
