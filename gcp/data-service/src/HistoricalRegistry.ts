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
      [Routes.Tokens, this._tokens, true],
      [Routes.Exchanges, this._exchanges, false],
      [Routes.Oracles, this._oracles, true],
      [Routes.Configuration, this._configurations, false],
    ] as [Routes, ClientRegistry<unknown> | undefined, boolean][];

    for (const [route, client, allNetwork] of clients) {
      if (client) {
        if (network === Network.All && !allNetwork) {
          continue;
        }
        await new Promise<void>((resolve) => {
          client.triggerRefresh(network, 0, resolve, blockNumber);
          if (route == Routes.Tokens)
            Registry.registerDefaultPoolTokens(network);
        });
      }
    }
  }
}
