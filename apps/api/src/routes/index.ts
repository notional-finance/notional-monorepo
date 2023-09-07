import { handleGeoIP } from './geoip';
import { handleNewsletter } from './newsletter';
import {
  DurableObjectNamespace,
  Request as CFRequest,
} from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { APIEnv } from '@notional-finance/durable-objects';
import BetaPass from '../assets/BetaPass';

function _handler(request: IRequest, ns: DurableObjectNamespace, name: string) {
  const stub = ns.get(ns.idFromName(name));
  return stub.fetch(request as unknown as CFRequest);
}

const handleKPIs = (_request: IRequest, _env: APIEnv) => {
  return new Response(
    JSON.stringify({
      totalAccounts: 5000,
      totalLoanVolume: 100_000_000_000,
      totalValueLocked: 10_000_000_000,
    })
  );
  // return _handler(request, env.KPIS_DO, env.KPIS_NAME);
};

const handleYields = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.ACCOUNTS_REGISTRY_DO, env.VERSION);
};

const handleTokens = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.TOKEN_REGISTRY_DO, env.VERSION);
};

const handleAccounts = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.ACCOUNTS_REGISTRY_DO, env.VERSION);
};

const handleConfigurations = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.CONFIGURATION_REGISTRY_DO, env.VERSION);
};

const handleOracles = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.ORACLE_REGISTRY_DO, env.VERSION);
};

const handleExchanges = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.EXCHANGE_REGISTRY_DO, env.VERSION);
};

const handleVaults = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.VAULT_REGISTRY_DO, env.VERSION);
};

const handleViews = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.VIEWS_DO, env.VIEWS_NAME);
};

const handleNFT = (request: IRequest, _env: APIEnv) => {
  const url = new URL(request.url);
  const [_, _nft, address, _tokenId] = url.pathname.split('/');
  // Additional metadata standards can be found here:
  // https://docs.opensea.io/docs/metadata-standards
  switch (address.toLowerCase()) {
    case '0x965b3aad78cdab2cc778243b12705ba3b7c5048c':
      return new Response(
        JSON.stringify({
          name: 'Notional ARB Beta',
          description: 'Notional Arbitrum Beta contest pass.',
          image: BetaPass,
        })
      );
    default:
      return new Response('404', { status: 404 });
  }
};

const handleDataDogForward = (request: IRequest, _env: APIEnv) => {
  const ddforward = decodeURI((request.query['ddforward'] as string) || '');
  if (ddforward) {
    const _request = request as unknown as CFRequest;

    return fetch(`https://browser-intake-datadoghq.com${ddforward}`, {
      method: 'POST',
      body: request.body,
      headers: {
        'X-Forwarded-For': _request.headers['CF-Connecting-IP'],
        'Content-Type': 'application/json',
      },
    });
  }
  return new Response('Invalid ddforward param', { status: 500 });
};

const handlePlausibleForward = (request: IRequest, _env: APIEnv) => {
  return fetch('https://plausible.io/api/event', request);
};

export {
  handleKPIs,
  handleGeoIP,
  handleNewsletter,
  handleYields,
  handleTokens,
  handleConfigurations,
  handleOracles,
  handleExchanges,
  handleAccounts,
  handleVaults,
  handleViews,
  handleNFT,
  handleDataDogForward,
  handlePlausibleForward,
};
