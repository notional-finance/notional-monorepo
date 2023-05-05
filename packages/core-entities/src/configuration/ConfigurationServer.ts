import { ServerRegistry } from '../registry/ServerRegistry';
import { getBuiltGraphSDK, AllConfigurationQuery } from '../.graphclient';
import { Network } from '..';

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected _refresh(network: Network) {
    const sdk = getBuiltGraphSDK();
    return this._fetchUsingGraph<AllConfigurationQuery>(
      network,
      sdk.AllConfiguration as (
        variables?: unknown,
        options?: unknown
      ) => Promise<AllConfigurationQuery>,
      (r) => {
        return { network: r };
      }
    );
  }
}
