import { DurableObjectState } from '@cloudflare/workers-types';
import {
  AccountDOStorage,
  APIEnv,
  corsHeaders,
  EnterVaultConditionSummary,
  EventSignature,
  SentinalRequest,
} from './types';
import { unique } from '@notional-finance/helpers';
import {
  SentinelConditionSummary,
  BlockTriggerEvent,
} from 'defender-autotask-utils';
//import { log } from '@notional-finance/logging';

export class AccountsDO {
  state: DurableObjectState;
  env: APIEnv;

  constructor(state: DurableObjectState, env: APIEnv) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      const req = request.clone();
      const { method } = request;
      if (method !== 'POST' && method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      if (method === 'POST') {
        return this.update(req);
      } else if (method === 'GET') {
        return this.get(req);
      }
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.log(error);
      return new Response((error as Error).message, { status: 400 });
    }
  }

  async update(request: Request) {
    try {
      const { events }: SentinalRequest = await request.json();
      if (events && events.length > 0) {
        const { id, network } = events[0].sentinel;
        if (id !== this.env.SENTINEL_ID) {
          return new Response('Bad Request', { status: 400 });
        }
        const { matchReasons } = events[0];
        const eventSummary = matchReasons.find(
          (e) => e.type === 'event'
        ) as SentinelConditionSummary;

        if (eventSummary?.signature === EventSignature.AccountContextUpdate) {
          return this.handleAccountContextUpdate(events, network);
        } else if (
          eventSummary.signature === EventSignature.VaultEnterPosition
        ) {
          return this.handleVaultEnterPosition(eventSummary, network);
        }
      }
      return new Response('No New Accounts', {
        status: 200,
        statusText: 'OK',
      });
    } catch (e) {
      /* await log({
        message: (e as Error).message,
        level: 'error',
        action: 'accounts-do-update',
      }); */
      return new Response((e as Error).message, { status: 500 });
    }
  }

  async handleAccountContextUpdate(
    events: BlockTriggerEvent[],
    network: string
  ) {
    const accounts = unique(events.map((e) => e.params.account));

    const existingAccounts = (await this.state.storage.get<
      AccountDOStorage | string[]
    >(network)) ?? { accounts: [], vaults: {} };

    if (existingAccounts instanceof Array) {
      return this.migrateStorage(network, existingAccounts);
    }

    if (network && accounts) {
      const newAccts = (accounts as string[]).filter(
        (a: string) => !existingAccounts.accounts.includes(a)
      );
      existingAccounts.accounts.push(...newAccts);
      await this.state.storage.put(network, existingAccounts);
      return new Response('Accounts Updated', {
        status: 200,
        statusText: 'OK',
      });
    }
    return new Response('No New Accounts', {
      status: 200,
      statusText: 'OK',
    });
  }

  async migrateStorage(network: string, accounts: string[]) {
    await this.state.storage.put(network, {
      accounts,
      vaults: {},
    });
    return new Response('Accounts Converted', {
      status: 200,
      statusText: 'OK',
    });
  }

  async handleVaultEnterPosition(
    eventSummary: EnterVaultConditionSummary,
    network: string
  ) {
    const { vault, account } = eventSummary.params;
    const storage = (await this.state.storage.get<AccountDOStorage | string[]>(
      network
    )) ?? { accounts: [], vaults: {} };

    if (storage instanceof Array) {
      return this.migrateStorage(network, storage);
    }
    if (!storage.vaults) {
      storage.vaults = {};
    }
    const existingVaults = storage.vaults[vault] ?? [];
    if (!existingVaults.includes(account)) {
      existingVaults.push(account);
      storage.vaults[vault] = existingVaults;
      await this.state.storage.put(network, storage);
    }
    return new Response('Vault Accounts Updated', {
      status: 200,
      statusText: 'OK',
    });
  }

  async get(request: Request) {
    try {
      const { url } = request;
      const network = new URL(url).searchParams.get('network');
      if (!network) {
        return new Response('Network Required', { status: 400 });
      }
      const storage = (await this.state.storage.get<
        AccountDOStorage | string[]
      >(network)) ?? { accounts: [], vaults: {} };

      if (storage instanceof Array) {
        return this.migrateStorage(network, storage);
      }

      return new Response(
        JSON.stringify({
          accounts: storage.accounts,
          network,
          vaults: storage.vaults,
        }),
        {
          status: 200,
          headers: { ...corsHeaders },
        }
      );
    } catch (e) {
      return new Response((e as Error).message, { status: 500 });
    }
  }
}
