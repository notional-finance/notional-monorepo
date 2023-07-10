import { TokenDefinition } from '..';
import { fiatTokens } from '../config/fiat-config';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import { getNowSeconds, Network } from '@notional-finance/util';

export class TokenRegistryServer extends ServerRegistry<TokenDefinition> {
  public override hasAllNetwork(): boolean {
    return true;
  }

  protected async _refresh(network: Network) {
    if (network === Network.All) {
      return {
        values: fiatTokens,
        network: Network.All,
        lastUpdateBlock: 0,
        lastUpdateTimestamp: getNowSeconds(),
      };
    }

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
          underlying: v.underlying?.id || undefined,
          maturity: parseInt(v.maturity) || undefined,
          vaultAddress: v.vaultAddress || undefined,
          isFCashDebt: v.isfCashDebt,
          currencyId: v.currencyId || undefined,
        };

        return obj;
      }, {} as Record<string, TokenDefinition>);
    });
  }
}
