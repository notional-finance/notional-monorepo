import httpserver from 'http-server';
import fs from 'fs';
import { Server } from 'http';
import { Network } from '@notional-finance/util';
import {
  Registry,
  AccountFetchMode,
  Routes,
  Servers,
  ClientRegistry,
  ServerRegistry,
} from '@notional-finance/core-entities';

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

    // NOTE: refresh needs to run in this particular order.
    const clients = [
      [Routes.Tokens, this._tokens],
      [Routes.Exchanges, this._exchanges],
      [Routes.Oracles, this._oracles],
      [Routes.Configuration, this._configurations],
      [Routes.Vaults, this._vaults],
      [Routes.Yields, this._yields],
    ] as [Routes, ClientRegistry<unknown> | undefined][];

    for (const [route, client] of clients) {
      const server = this.servers[route];
      if (server) {
        await this.servers[route].refreshAtBlock(network, blockNumber);
        // Write this to the temp registry
        const data = this.servers[route].serializeToJSON(network);
        fs.writeFileSync(`${this.tmpDataDirectory}/${network}/${route}`, data);
      }

      if (client) {
        await new Promise<void>((resolve) => {
          client.triggerRefresh(network, 0, resolve, blockNumber);
          if (route == Routes.Tokens)
            Registry.registerDefaultPoolTokens(network);
        });
      }
    }
  }
}
