import { fetchSystem } from '@notional-finance/sdk/data/SystemData';
import getUSDPriceData from '@notional-finance/sdk/data/sources/ExchangeRate';
import { BigNumber, ethers } from 'ethers';
/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
  SYSTEM_CACHE: DurableObjectNamespace;
  VAULT_RETURNS: R2Bucket;
  EXCHANGE_RATE_API_KEY: string;
  ALCHEMY_KEY: string;
  NX_DD_API_KEY: string;
  NX_DD_APP_ID: string;
  NX_DD_BASE_URL: string;
  VERSION: string;
  NX_ENV: string;
  NX_COMMIT_REF: string;
}

const REFRESH_INTERVAL_MILLISECONDS = 6 * 1000;

const supportedChains = [
  {
    chainId: 1,
    network: 'mainnet',
    url: 'https://eth-mainnet.alchemyapi.io/v2',
  },
  { chainId: 5, network: 'goerli', url: 'https://eth-goerli.alchemyapi.io/v2' },
];

export class SystemCache {
  private state: DurableObjectState;
  private storage: DurableObjectStorage;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.storage = state.storage;
    this.env = env;

    this.state.blockConcurrencyWhile(async () => {
      const currentAlarm = await this.storage.getAlarm();
      if (currentAlarm == null) {
        await this.alarm();
      }
    });
  }

  private parsePath(path: string) {
    const splitPath = path.split('/');

    return {
      version: splitPath[1],
      network: splitPath[2],
      action: splitPath.length < 4 ? 'cache' : splitPath[3],
    };
  }

  async fetch(request: Request) {
    try {
      const url = new URL(request.url);
      const currentAlarm = await this.storage.getAlarm();
      const currentMillis = Date.now();
      switch (url.pathname) {
        case '/refresh-exchange-rate':
          return this.refreshExchangeRates();
        case '/schedule-alarm':
          if (currentAlarm == null || currentAlarm < currentMillis) {
            await this.alarm();
          }
          return new Response('OK', { status: 200, statusText: 'OK' });
        default:
          return this.fetchDataRequest(request);
      }
    } catch (e: any) {
      console.error(e);
      return new Response(e, { status: 500 });
    }
  }

  async fetchDataRequest(request: Request) {
    const url = new URL(request.url);
    const { version, network, action } = this.parsePath(url.pathname);
    if (version !== this.env.VERSION) {
      return new Response('Incorrect Version', { status: 404 });
    } else if (action === 'cache') {
      const encoding = url.searchParams.get('encoding') ?? 'json';

      const data = await this.storage.get<string>(
        `${network}:cache:${encoding}`
      );
      if (data === undefined) {
        return new Response('No Data', { status: 404 });
      }

      return new Response(data, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type':
            encoding === 'json' ? 'application/json' : 'application/protobuf',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else if (action === 'vault-returns') {
      const [_, __, ___, ____, vaultAddress, maturity] =
        url.pathname.split('/');
      let obj = await this.env.VAULT_RETURNS.get(
        `/${network}/${vaultAddress}/latest.json`
      );
      if (!obj) {
        // Try a more specific key if the vault returns depend on maturity
        obj = await this.env.VAULT_RETURNS.get(
          `/${network}/${vaultAddress}/${maturity}`
        );
        if (!obj) return new Response('Not Found', { status: 404 });
      }

      return new Response(await obj.json(), {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }

  async refreshExchangeRates() {
    try {
      const usdExchangeRates = await getUSDPriceData(
        this.env.EXCHANGE_RATE_API_KEY,
        true
      );
      await this.storage.put(`cache:usdExchangeRates`, usdExchangeRates);
      return new Response('OK', { status: 200, statusText: 'OK' });
    } catch (e) {
      return new Response('Error', { status: 500, statusText: 'Error' });
    }
  }

  async useCachedExchangeRates() {
    const rates = await this.storage.get<Record<string, BigNumber>>(
      `cache:usdExchangeRates`
    );
    return rates || {};
  }

  async alarm() {
    const usdExchangeRates = await this.useCachedExchangeRates();

    for (const chain of supportedChains) {
      const { url, network, chainId } = chain;
      try {
        const providerUrl = `${url}/${this.env.ALCHEMY_KEY}`;
        const providerNetwork = ethers.providers.getNetwork(network);
        // skipFetchSetup is required to get this to work inside web workers
        // https://github.com/ethers-io/ethers.js/issues/1886
        const provider = new ethers.providers.JsonRpcBatchProvider(
          { url: providerUrl, skipFetchSetup: true },
          providerNetwork
        );

        const { binary, json } = await fetchSystem(
          chainId,
          provider,
          '',
          true,
          usdExchangeRates
        );
        await this.storage.put(`${network}:cache:binary`, binary);
        await this.storage.put(`${network}:cache:json`, json);
      } catch (e) {
        console.log({
          message: (e as Error).toString(),
          action: 'cache_update',
          level: 'error',
          chain: network,
        });
      }
    }

    this.storage.setAlarm(Date.now() + REFRESH_INTERVAL_MILLISECONDS);
  }
}

export default {
  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    const id = env.SYSTEM_CACHE.idFromName('SYSTEM_CACHE_V2');
    const stub = env.SYSTEM_CACHE.get(id);
    // Nightly exchange rate update
    if (event.cron === '0 0 * * *') {
      await stub.fetch('http://api.notional.finance/refresh-exchange-rate');
    } else {
      // Otherwise, we're just kicking the durable storage object to make sure that the
      // alarm is set for recurring updates. This URL is not actually used.
      await stub.fetch('http://api.notional.finance/schedule-alarm');
    }
  },
  async fetch(request: Request, env: Env) {
    try {
      const id = env.SYSTEM_CACHE.idFromName('SYSTEM_CACHE_V2');
      const stub = env.SYSTEM_CACHE.get(id);
      return await stub.fetch(request);
    } catch (e: any) {
      return new Response(e, { status: 500 });
    }
  },
};
