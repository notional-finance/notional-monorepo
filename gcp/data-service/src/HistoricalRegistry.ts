import { Network } from '@notional-finance/util';
import {
  Registry,
  AccountFetchMode,
  Routes,
  ClientRegistry,
} from '@notional-finance/core-entities';

export class HistoricalRegistry extends Registry {
  static override initialize(
    cacheHostname: string,
    fetchMode: AccountFetchMode
  ) {
    super.initialize(cacheHostname, fetchMode, false);
  }

  public static async refreshAtBlock(network: Network, blockNumber: number) {
    // NOTE: refresh needs to run in this particular order.
    const clients = [
      [Routes.Tokens, this._tokens],
      [Routes.Exchanges, this._exchanges],
      [Routes.Oracles, this._oracles],
      [Routes.Configuration, this._configurations],
    ] as [Routes, ClientRegistry<unknown> | undefined][];

    for (const [route, client] of clients) {
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
