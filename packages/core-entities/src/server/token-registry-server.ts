import { BigNumber } from 'ethers';
import { SerializedTokenBalance, TokenBalance, TokenDefinition } from '..';
import { fiatTokens } from '../config/fiat-config';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';
import {
  getNowSeconds,
  Network,
  sNOTE,
  WETHAddress,
} from '@notional-finance/util';
import { TypedDocumentNode } from '@apollo/client/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllTokensQuery } from '../.graphclient';

export type SerializedToken =
  | (Omit<TokenDefinition, 'totalSupply'> & {
      totalSupply: SerializedTokenBalance | undefined;
    })
  | TokenDefinition;

export class TokenRegistryServer extends ServerRegistry<SerializedToken> {
  public override hasAllNetwork(): boolean {
    return true;
  }

  protected async _refresh(network: Network, blockNumber?: number) {
    if (network === Network.all) {
      return {
        values: fiatTokens,
        network: Network.all,
        lastUpdateBlock: blockNumber || 0,
        lastUpdateTimestamp: getNowSeconds(),
      };
    }

    const { AllTokensDocument, AllTokensByBlockDocument } =
      await loadGraphClientDeferred();

    const allTokens = await this._fetchUsingGraph(
      network,
      (blockNumber !== undefined
        ? AllTokensByBlockDocument
        : AllTokensDocument) as TypedDocumentNode<AllTokensQuery, unknown>,
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
            underlying: v.underlying?.id || undefined,
            maturity: parseInt(v.maturity) || undefined,
            vaultAddress: v.vaultAddress || undefined,
            isFCashDebt: v.isfCashDebt,
            currencyId: v.currencyId || undefined,
            totalSupply: v.totalSupply
              ? TokenBalance.toJSON(
                  BigNumber.from(v.totalSupply),
                  v.id,
                  network
                )
              : undefined,
          };

          return obj;
        }, {} as Record<string, SerializedToken>);
      },
      this.env.NX_SUBGRAPH_API_KEY,
      {
        blockNumber,
      }
    );

    if (network === Network.mainnet) {
      // Manually add sNOTE to the mainnet network
      allTokens.values.push(
        [
          sNOTE,
          {
            id: sNOTE,
            address: sNOTE,
            network: Network.mainnet,
            name: 'Staked NOTE',
            symbol: 'sNOTE',
            decimals: 18,
            tokenInterface: 'ERC20',
            tokenType: 'Underlying',
            totalSupply: undefined,
          },
        ],
        [
          WETHAddress[Network.mainnet],
          {
            id: WETHAddress[Network.mainnet],
            address: WETHAddress[Network.mainnet],
            network: Network.mainnet,
            name: 'Wrapped Ether',
            symbol: 'WETH',
            decimals: 18,
            tokenInterface: 'ERC20',
            tokenType: 'Underlying',
            totalSupply: undefined,
          },
        ]
      );
    }

    return allTokens;
  }
}
