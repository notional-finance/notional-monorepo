import Plausible from 'plausible-tracker';

export const GOOGLE_ANALYTICS_ID = 'G-TN4TT2L24X';

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
