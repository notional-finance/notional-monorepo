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
const PROXY_HOST =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';
const service = 'web-frontend';
const { disableErrorReporting } = getFromLocalStorage('privacySettings');

datadogRum.init({
  beforeSend: () => {
    if (disableErrorReporting) {
      return false;
    }
  },
  applicationId,
  clientToken,
  site: DD_SITE,
  service,
  env: window.location.hostname,
  version,
  sampleRate: 100,
  trackInteractions: false,
  proxy: `${PROXY_HOST}/dd-forward`,
});

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
