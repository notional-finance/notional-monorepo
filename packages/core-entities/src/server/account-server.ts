import { Network } from '@notional-finance/util';
import { loadGraphClientDeferred, ServerRegistry } from './server-registry';

export class AccountServer extends ServerRegistry<AccountDefinition> {
  /** Returns all the active accounts on the network */
  protected async _refresh(network: Network) {
    // const { AllConfigurationDocument } = await loadGraphClientDeferred();
    // return this._fetchUsingGraph(network, AllConfigurationDocument, (r) => {
    //   return { [network]: r };
    // });
  }
}
