import { handleGeoIP } from './geoip';
import { handleNewsletter } from './newsletter';
import { handleNFT } from './nft';
import {
  DurableObjectNamespace,
  Request as CFRequest,
} from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { APIEnv, getRegistryData } from '@notional-finance/durable-objects';

function _handler(request: IRequest, ns: DurableObjectNamespace, name: string) {
  const stub = ns.get(ns.idFromName(name));
  return stub.fetch(request as unknown as CFRequest);
}

const handleYields = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.ACCOUNTS_REGISTRY_DO, env.VERSION);
};

const handleRegistryData = (request: IRequest, env: APIEnv) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  return getRegistryData(env, pathname);
};

const handleAccounts = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.ACCOUNTS_REGISTRY_DO, env.VERSION);
};

const handleNOTEData = (request: IRequest, env: APIEnv) => {
  const key = new URL(request.url).pathname.slice(1);
  return env.ACCOUNT_CACHE_R2.get(key);
};

const handleViews = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.VIEWS_DO, env.VIEWS_NAME);
};

const handleKPI = (request: IRequest, env: APIEnv) => {
  return env.ACCOUNT_CACHE_R2.get('kpi');
};

const handleDataDogForward = async (request: IRequest, _env: APIEnv) => {
  const ddforward = (request.query['ddforward'] as string) || '';
  if (ddforward) {
    const _request = request as unknown as CFRequest;
    const body = await request.text();
    return fetch(`https://browser-intake-datadoghq.com${ddforward}`, {
      method: 'POST',
      body,
      headers: {
        'X-Forwarded-For': _request.headers.get('cf-connecting-ip'),
      },
    });
  }
  return new Response('Invalid ddforward param', { status: 500 });
};

const handlePlausibleForward = async (request: IRequest, _env: APIEnv) => {
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
  handleYields,
  handleAccounts,
  handleRegistryData,
  handleViews,
  handleNFT,
  handleDataDogForward,
  handlePlausibleForward,
  handleNOTEData,
  handleKPI,
};
