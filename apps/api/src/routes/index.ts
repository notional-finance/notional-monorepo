import { handleGeoIP } from './geoip';
import { handleNewsletter } from './newsletter';
import { handleNFT } from './nft';
import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';

const handleDataDogForward = async (request: IRequest) => {
  const ddforward = (request.query['ddforward'] as string) || '';
  if (ddforward) {
    const _request = request as unknown as CFRequest;
    const body = await request.text();
    return fetch(`https://browser-intake-datadoghq.com${ddforward}`, {
      method: 'POST',
      body,
      headers: {
        'X-Forwarded-For': _request.headers.get('cf-connecting-ip') || '',
      },
    });
  }
  return new Response('Invalid ddforward param', { status: 500 });
};

const handlePlausibleForward = async (request: IRequest) => {
  const body = JSON.stringify(await request.json());
  return await fetch('https://plausible.io/api/event', {
    method: 'POST',
    body,
    headers: {
      'User-Agent': request.headers.get('user-agent'),
      'X-Forwarded-For': request.headers.get('cf-connecting-ip'),
      'Content-Type': 'application/json',
    },
  });
};

export {
  handleGeoIP,
  handleNewsletter,
  handleNFT,
  handleDataDogForward,
  handlePlausibleForward,
};
