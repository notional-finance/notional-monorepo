import Plausible, { EventOptions } from 'plausible-tracker';

const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance';

let _trackEvent: ReturnType<typeof Plausible>['trackEvent'];

export function initPlausible() {
  const { trackEvent: track, enableAutoPageviews } = Plausible({
    domain: window.location.hostname,
    apiHost: `${PROXY_HOST}/plausible`,
  });
  _trackEvent = track;

  enableAutoPageviews();
}

export function trackEvent(category: string, props?: EventOptions['props']) {
  _trackEvent(category, { props });
}
