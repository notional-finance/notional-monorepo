import { Request } from '@cloudflare/workers-types';
import { Router, IRequest } from 'itty-router';
import { APIEnv } from '@notional-finance/durable-objects';
import {
  handleConfigurations,
  handleExchanges,
  handleGeoIP,
  handleNewsletter,
  handleOracles,
  handleTokens,
  handleYields,
  handleVaults,
  handleViews,
  handleNFT,
  handleDataDogForward,
  handlePlausibleForward,
  handleKPIs,
} from './routes';

export {
  TokenRegistryDO,
  ConfigurationRegistryDO,
  ExchangeRegistryDO,
  OracleRegistryDO,
  VaultRegistryDO,
  ViewsDO,
} from '@notional-finance/durable-objects';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Max-Age': '86400',
};

function handleOptions(request: IRequest) {
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    const respHeaders = {
      ...corsHeaders,
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers'
      ),
    };
    return new Response(null, { headers: respHeaders });
  }

  return new Response(null, {
    headers: {
      Allow: 'GET, OPTIONS, POST',
    },
  });
}

const router = Router();
// Handles preflight options
router.options('*', handleOptions);

router.get('/kpis', handleKPIs);
router.get('/geoip', handleGeoIP);
router.get('/nft/*', handleNFT);
router.post('/dd-forward', handleDataDogForward);
router.post('/plausible', handlePlausibleForward);
router.post('/newsletter', handleNewsletter);
router.get('/:network/views/:view', handleViews);
router.get('/:network/yields', handleYields);
router.get('/:network/tokens', handleTokens);
router.get('/:network/configuration', handleConfigurations);
router.get('/:network/oracles', handleOracles);
router.get('/:network/exchanges', handleExchanges);
router.get('/:network/vaults', handleVaults);

// Fall through catch for 404 errors
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request: Request, env: APIEnv): Promise<Response> {
    return router
      .handle(request, env)
      .then((response: Response) => {
        // Don't edit the OPTIONS preflight response
        if (request.method === 'OPTIONS') return response;

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            // Set default headers if unset
            ...corsHeaders,
            'Content-Type': 'application/json',
            // Response specific headers will override above
            ...response.headers,
          },
        });
      })
      .catch((err) => {
        return new Response(err, {
          status: 500,
          headers: {
            // Set default headers if unset
            ...corsHeaders,
            'Content-Type': 'application/text',
          },
        });
      });
  },
};
