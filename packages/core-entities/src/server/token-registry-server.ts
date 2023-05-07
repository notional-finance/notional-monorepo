import { TokenDefinition } from '..';
import { ServerRegistry } from './server-registry';
import { getBuiltGraphSDK, AllTokensQuery } from '../.graphclient';
import { Network } from '@notional-finance/util';

export class TokenRegistryServer extends ServerRegistry<TokenDefinition> {
  public static CachePath = 'tokens';

  protected _refresh(network: Network) {
    const sdk = getBuiltGraphSDK();
    return this._fetchUsingGraph<AllTokensQuery>(
      network,
      sdk.AllTokens as (
        variables?: unknown,
        options?: unknown
      ) => Promise<AllTokensQuery>,
      (r) => {
        return r.tokens.reduce((obj, v) => {
          obj[v.id] = {
            id: v.id,
            address: v.tokenAddress as string,
            network,
            name: v.name,
            symbol: v.symbol,
            decimals: v.decimals,
            tokenInterface: v.tokenInterface,
            tokenType: v.tokenType,
            underlying: v.underlying as string | undefined,
            maturity: v.maturity as number | undefined,
            vaultAddress: v.vaultAddress as string | undefined,
            isFCashDebt: v.isfCashDebt,
          };

          return obj;
        }, {} as Record<string, TokenDefinition>);
      }
    );
  }
}
