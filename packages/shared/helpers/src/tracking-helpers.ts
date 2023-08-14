import Plausible from 'plausible-tracker';

export function initPlausible() {
  return Plausible({
    domain: window.location.hostname,
    apiHost: 'https://plausible.io',
  });
}

export function trackEvent(category: string, props?: Record<string, any>) {
  const { trackEvent } = Plausible();
  trackEvent(category, props);
}
