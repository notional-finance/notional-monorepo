import Plausible from 'plausible-tracker';

const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data.notional.finance';

let _trackEvent: ReturnType<typeof Plausible>['trackEvent'];

export function initPlausible() {
  const { trackEvent, enableAutoOutboundTracking, enableAutoPageviews } =
    Plausible({
      domain: window.location.hostname,
      apiHost: `${PROXY_HOST}/plausible`,
    });
  _trackEvent = trackEvent;

  enableAutoPageviews();
  enableAutoOutboundTracking();
}

export function trackEvent(category: string, props?: Record<string, any>) {
  _trackEvent(category, props);
}
