import httpserver from 'http-server';
import fs from 'fs';
import { Server } from 'http';

import { Registry } from './Registry';
import { AccountFetchMode } from './client/account-registry-client';
import { Network } from '@notional-finance/util';
import { ServerRegistry } from './server/server-registry';
import { Servers, Routes } from './server';
import { ClientRegistry } from './client/client-registry';

export class HistoricalRegistry extends Registry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected static servers?: Record<string, ServerRegistry<any>>;

  public static tmpDataDirectory?: string;
  public static server: Server;

  public static async startHost(tmpDataDirectory: string, port: number) {
    this.tmpDataDirectory = tmpDataDirectory;

    this.server = httpserver.createServer({
      root: tmpDataDirectory,
    });

    // First startup localhost server.
    await new Promise<void>((resolve) => {
      this.server.listen(port, () => {
        console.log('Server listening on ', port);
        resolve();
      });
    });
  }

  static override initialize(
    cacheHostname: string,
    fetchMode: AccountFetchMode
  ) {
    super.initialize(cacheHostname, fetchMode, false);

    // Create server registries here
    HistoricalRegistry.servers = {
      [Routes.Tokens]: new Servers.TokenRegistryServer(),
      [Routes.Exchanges]: new Servers.ExchangeRegistryServer(),
      [Routes.Oracles]: new Servers.OracleRegistryServer(),
      [Routes.Vaults]: new Servers.VaultRegistryServer(),
      [Routes.Configuration]: new Servers.ConfigurationServer(),
    };
  }

  public static async refreshAtBlock(network: Network, blockNumber: number) {
    if (!this.servers) throw Error('Servers undefined');
    if (!this.tmpDataDirectory) throw Error('Servers undefined');

    await Promise.all(
      Object.keys(this.servers).map(async (k) => {
        if (!this.servers) throw Error('Servers undefined');
        await this.servers[k].refreshAtBlock(network, blockNumber);
        // Write this to the temp registry
        const data = this.servers[k].serializeToJSON(network);
        fs.writeFileSync(`${this.tmpDataDirectory}/${network}/${k}`, data);

        let client: ClientRegistry<any> | undefined;
        if (k === Routes.Tokens) {
          client = this._tokens;
        } else if (k === Routes.Exchanges) {
          client = this._exchanges;
        } else if (k === Routes.Oracles) {
          client = this._oracles;
        } else if (k === Routes.Configuration) {
          client = this._configurations;
        } else if (k === Routes.Vaults) {
          client = this._vaults;
        } else {
          return;
        }

        if (client) {
          await new Promise<void>((resolve) => {
            if (client) client.triggerRefresh(network, 0, resolve);
          });
        }
      })
    );
  }

  public static async refreshOverRange(network: Network, blocks: number[]) {
    const results: any[] = [];
    for (const block of blocks) {
      await this.refreshAtBlock(network, block);
      results.push(...this.getTokenRegistry().getAllSubjectKeys(network));
    }

    return results;
  }
}
