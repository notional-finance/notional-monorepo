import Plausible from 'plausible-tracker';

const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance';

export function initPlausible() {
  return Plausible({
    domain: window.location.hostname,
    apiHost: `${PROXY_HOST}/plausible`,
  });
}

export function trackEvent(category: string, props?: Record<string, any>) {
  const { trackEvent } = Plausible();
  trackEvent(category, props);
}
