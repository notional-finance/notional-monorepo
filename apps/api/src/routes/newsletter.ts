import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { Network, Logger } from '@notional-finance/util';
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
    const logger = new Logger({
      apiKey: env.NX_DD_API_KEY,
      version: env.NX_COMMIT_REF,
      env: env.NX_ENV,
      service: 'newsletter',
    });
    logger.submitEvent({
      host: 'cloudflare',
      network: Network.all,
      aggregation_key: 'NewsletterSubmitFailure',
      alert_type: 'error',
      title: 'Newsletter Submit Failure',
      tags: ['newsletter', 'api-worker'],
      text: JSON.stringify({ error: err.toString() }),
    });
    return new Response(err.toString(), { status: 500 });
  }
}
