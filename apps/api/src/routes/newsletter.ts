import {
  DDEventAlertType,
  DDEventKey,
  initEventLogger,
  submitEvent,
} from '@notional-finance/logging';
import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { APIEnv } from '..';

// NOTE: this posts to Netlify because the Cloudflare worker environment is not compatible
// with jsonwebtoken signing.
export async function handleNewsletter(_request: IRequest, env: APIEnv) {
  try {
    const request = _request as unknown as CFRequest;
    const data = await request.formData();
    const email = data.get('email');

    const url =
      'https://classic.notional.finance/.netlify/functions/newsletter';
    const payload = { data: { email } };

    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ payload }),
    });

    if (resp.status === 200) {
      return new Response('POST Success', { status: 200 });
    } else {
      throw Error(await resp.text());
    }
  } catch (err) {
    initEventLogger({ apiKey: env.NX_DD_API_KEY });
    submitEvent({
      aggregation_key: DDEventKey.NewsletterSubmitFailure,
      alert_type: DDEventAlertType.error,
      title: 'Newsletter Submit Failure',
      tags: ['newsletter', 'api-worker'],
      text: JSON.stringify({ error: err.toString() }),
    });
    return new Response(err.toString(), { status: 500 });
  }
}
