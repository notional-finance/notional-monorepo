import GhostContentAPI from '@tryghost/content-api';

export function getGhostContentAPI() {
  return new GhostContentAPI({
    url: 'https://notional-finance.ghost.io',
    key: '8aaf8ab675aff1a497228a380b',
    version: 'v5.0',
  });
}
