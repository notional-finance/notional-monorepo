import {
  DDEventAlertType,
  DDEventKey,
  initEventLogger,
  submitEvent,
} from '@notional-finance/logging';
import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import jwt from 'jsonwebtoken';
import { APIEnv } from '..';

function getToken(env: APIEnv) {
  // Admin API key goes here
  const key = env.GHOST_ADMIN_KEY;

  // Split the key into ID and SECRET
  const [id, secret] = key.split(':');

  // Create the token (including decoding secret)
  return jwt.sign({}, Buffer.from(secret, 'hex'), {
    keyid: id,
    algorithm: 'HS256',
    expiresIn: '5m',
    audience: `/canary/admin/`,
  });
}

export async function handleNewsletter(_request: IRequest, env: APIEnv) {
  try {
    const request = _request as unknown as CFRequest;
    const { email } = await request.json<{ email: string }>();
    const token = getToken(env);

    const url = 'https://notional-finance.ghost.io/ghost/api/admin/members/';
    const headers = { Authorization: `Ghost ${token}` };
    const payload = {
      members: [
        { email: email, subscribed: true, labels: ['via-landing-page'] },
      ],
    };

    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
    });

    return new Response('POST Success', { status: 200 });
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
