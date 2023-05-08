import { TokenDefinition } from '..';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { Network } from '@notional-finance/util';

export class TokenRegistryServer extends ServerRegistry<TokenDefinition> {
  protected async _refresh(network: Network) {
    const { AllTokensDocument } = await loadGraphClientDeferred();
    return this._fetchUsingGraph(network, AllTokensDocument, (r) => {
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
    });
  }
}
