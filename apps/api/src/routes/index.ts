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

const handleKPIs = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.KPIS_DO, env.KPIS_NAME);
};

const handleYields = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.YIELD_REGISTRY_DO, env.YIELDS_NAME);
};

const handleTokens = (request: IRequest, env: APIEnv) => {
  return _handler(request, env.TOKEN_REGISTRY_DO, env.VERSION);
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

export {
  handleKPIs,
  handleGeoIP,
  handleNewsletter,
  handleYields,
  handleTokens,
  handleConfigurations,
  handleOracles,
  handleExchanges,
  handleVaults,
  handleViews,
  handleNFT,
};
