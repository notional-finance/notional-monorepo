import httpserver from 'http-server';
import fs from 'fs';
import { Server } from 'http';

import { Registry } from './Registry';
import { AccountFetchMode } from './client/account-registry-client';
import { Network } from '@notional-finance/util';
import { ServerRegistry } from './server/server-registry';
import { Servers, Routes } from './server';

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
        resolve();
      });
    });
  }

  static override initialize(
    cacheHostname: string,
    fetchMode: AccountFetchMode
  ) {
    super.initialize(cacheHostname, fetchMode);

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
      })
    );
  }

  public static async refreshOverRange(network: Network, blocks: number[]) {
    const results: any[] = [];
    for (const block of blocks) {
      await this.refreshAtBlock(network, block);
      results.push(...this.getExchangeRegistry().getAllSubjectKeys(network));
    }

    return results;
  }
}
