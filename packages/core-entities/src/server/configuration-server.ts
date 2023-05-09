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
  protected async _refresh(network: Network) {
    const { AllConfigurationDocument } = await loadGraphClientDeferred();
    return this._fetchUsingGraph(network, AllConfigurationDocument, (r) => {
      return { [network]: r };
    });
  }
}
