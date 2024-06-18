import { TypedDocumentNode } from '@apollo/client/core';
import {
  DocumentTypes,
  loadGraphClientDeferred,
  ServerRegistry,
  TypedDocumentReturnType,
} from './server-registry';
import { Network } from '@notional-finance/util';

export type AllConfigurationQuery = TypedDocumentReturnType<
  DocumentTypes['AllConfigurationDocument']
>;

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected async _refresh(network: Network, blockNumber?: number) {
    const { AllConfigurationDocument, AllConfigurationByBlockDocument } =
      await loadGraphClientDeferred();
    return this._fetchUsingGraph(
      network,
      (blockNumber !== undefined
        ? AllConfigurationByBlockDocument
        : AllConfigurationDocument) as TypedDocumentNode<
        AllConfigurationQuery,
        unknown
      >,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY,
      {
        blockNumber,
      }
    );
  }
}
