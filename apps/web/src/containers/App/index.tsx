import { datadogRum } from '@datadog/browser-rum';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { App } from './App';

const applicationId = process.env['NX_DD_APP_ID'] as string;
const clientToken = process.env['NX_DD_CLIENT_TOKEN'] as string;
const DD_SITE = process.env['NX_DD_SITE'];
// COMMIT_REF environment variable is supplied by netlify on deployment
const version = `${process.env['NX_COMMIT_REF']?.substring(0, 8) || 'local'}`;
// NOTE: this is the proxy service used to collect datadog RUM data
const PROXY_HOST = 'https://api.notional.finance';
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
    defaultPrivacyLevel: 'mask',
    sessionSampleRate: 100,
    sessionReplaySampleRate: privacySettings['disableTracking'] ? 0 : 10,
    trackUserInteractions: true,
    proxy: `${PROXY_HOST}/dd-forward`,

    beforeSend: (event) => {
      if (privacySettings['disableErrorReporting'] && event.type === 'error') {
        return false;
      }
      return true;
    },
  });
}

export const AppShell = () => {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <App />
      </QueryParamProvider>
    </BrowserRouter>
  );
};
export default AppShell;
