import { useHistory, useLocation } from 'react-router';
import { useAppContext, useNotionalContext } from './use-notional';
import { useEffect } from 'react';
import { isTestHost } from '@notional-finance/util';

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
  const {
    appState: { country },
  } = useAppContext();
  const isProd = env === 'production' && !isTestHost();

  return isProd
    ? country === undefined || country === 'US' || country === 'VPN'
    : false;
}

export function useSanctionsBlock() {
  const {
    appState: { country },
  } = useAppContext();
  const {
    globalState: { isSanctionedAddress },
  } = useNotionalContext();

  const history = useHistory();
  const { pathname } = useLocation();

  const isSanctioned =
    SanctionedCountries.find((s) => s === country) || isSanctionedAddress;
  useEffect(() => {
    if (isSanctioned && pathname !== 'error') {
      history.push('/error?code=451');
    }
  }, [history, pathname, isSanctioned]);
}
