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
];

export function useLeverageBlock() {
  const walletStore = useWalletStore();
  const country = walletStore.country;
  const isProd = env === 'production' && !isTestHost();

  return isProd
    ? country === undefined || country === 'US' || country === 'VPN'
    : false;
}

export function useSanctionsBlock() {
  const walletStore = useWalletStore();
  const country = walletStore.country;
  const isSanctionedAddress = walletStore.isSanctionedAddress;
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isSanctioned =
    SanctionedCountries.find((s) => s === country) || isSanctionedAddress;
  useEffect(() => {
    if (isSanctioned && pathname !== 'error') {
      navigate('/error?code=451');
    }
  }, [navigate, pathname, isSanctioned]);
}
