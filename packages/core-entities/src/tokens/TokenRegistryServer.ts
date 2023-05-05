import { AggregateCall } from '@notional-finance/multicall';
import { TokenDefinition, Network, TokenInterface, TokenType } from '..';
import { CacheSchema } from '../registry';
import { ServerRegistry } from '../registry/ServerRegistry';
import { getBuiltGraphSDK, AllTokensQuery } from '../.graphclient';

export class TokenRegistryServer extends ServerRegistry<TokenDefinition> {
  protected _getAggregateCalls(_network: Network): {
    calls: AggregateCall<TokenDefinition>[];
    transforms: ((
      r: Record<string, TokenDefinition>
    ) => Record<string, TokenDefinition>)[];
  } {
    throw Error('Unimplemented');
  }

  protected _refresh(network: Network): Promise<CacheSchema<TokenDefinition>> {
    const sdk = getBuiltGraphSDK();
    return this._fetchUsingGraph<AllTokensQuery>(
      network,
      sdk.AllTokens,
      (r) => {
        return r.tokens.reduce((obj, v) => {
          obj[v.id] = {
            id: v.id,
            address: v.tokenAddress as string,
            network,
            name: v.name,
            symbol: v.symbol,
            decimals: v.decimals,
            tokenInterface: v.tokenInterface as TokenInterface,
            tokenType: v.tokenType as TokenType,
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
