import {
  Request as CFRequest,
  IncomingRequestCfPropertiesGeographicInformation,
} from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import {
  initEventLogger,
  submitEvent,
  DDEventKey,
  DDEventAlertType,
} from '@notional-finance/logging';
import { APIEnv } from '@notional-finance/durable-objects';

export async function handleGeoIP(_request: IRequest, env: APIEnv) {
  try {
    const request = _request as unknown as CFRequest;
    const cfProps =
      request.cf as IncomingRequestCfPropertiesGeographicInformation;

    if (request.method === 'POST') {
      const requestBody = await request.text();
      initEventLogger({ apiKey: env.NX_DD_API_KEY });
      submitEvent({
        aggregation_key: DDEventKey.GeoIPLog,
        alert_type: DDEventAlertType.warning,
        title: 'GeoIP Log Event',
        tags: ['geoip', 'api-worker'],
        text: JSON.stringify({ requestBody, cfProps }),
      });
    }

    const country = cfProps['country'] || 'N/A';
    return new Response(JSON.stringify({ country }));
  } catch {
    return new Response(JSON.stringify({ country: 'N/A' }));
  }
}
