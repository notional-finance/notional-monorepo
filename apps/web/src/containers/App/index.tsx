import { datadogRum } from '@datadog/browser-rum';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { trackEvent, getFromLocalStorage } from '@notional-finance/helpers';
import { useEffect } from 'react';
import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { App } from './App';
import { TRACKING_EVENTS } from '@notional-finance/util';

const applicationId = process.env['NX_DD_APP_ID'] as string;
const clientToken = process.env['NX_DD_CLIENT_TOKEN'] as string;
const DD_SITE = process.env['NX_DD_SITE'];
// COMMIT_REF environment variable is supplied by netlify on deployment
const version = `${process.env['NX_COMMIT_REF']?.substring(0, 8) || 'local'}`;
const service = 'web-frontend';
const privacySettings = getFromLocalStorage('privacySettings');

if (
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('dev')
) {
  datadogRum.init({
    applicationId,
    clientToken,
    site: DD_SITE,
    service,
    env: window.location.hostname,
    version,
    defaultPrivacyLevel: 'allow',
    sessionSampleRate: 100,
    sessionReplaySampleRate: privacySettings['disableTracking'] ? 0 : 10,
    trackUserInteractions: true,
    // proxy: `${PROXY_HOST}/dd-forward`,

    beforeSend: (event) => {
      if (privacySettings['disableErrorReporting'] && event.type === 'error') {
        return false;
      }
      return true;
    },
  });
}

// eslint-disable-next-line @cspell/spellchecker
const growthbook = new GrowthBook({
  apiHost: 'https://cdn.growthbook.io',
  clientKey: 'sdk-I5Vp9ALYVkr78H6n',
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    trackEvent(TRACKING_EVENTS.VIEWED_EXPERIMENT, {
      experimentId: experiment.key,
      variationId: result.key,
    });
  },
});

export const AppShell = () => {
  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.init({ streaming: true });
  }, []);

  return (
    <GrowthBookProvider growthbook={growthbook}>
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <App />
        </QueryParamProvider>
      </BrowserRouter>
    </GrowthBookProvider>
  );
};
export default AppShell;
