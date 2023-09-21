import {
  Request as CFRequest,
  IncomingRequestCfPropertiesGeographicInformation,
} from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';

export async function handleGeoIP(_request: IRequest) {
  try {
    const request = _request as unknown as CFRequest;
    const cfProps =
      request.cf as IncomingRequestCfPropertiesGeographicInformation;

    const country = cfProps['country'] || 'N/A';
    return new Response(JSON.stringify({ country }));
  } catch {
    return new Response(JSON.stringify({ country: 'N/A' }));
  }
}
