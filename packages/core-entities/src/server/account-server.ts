import { Network } from '@notional-finance/util';
import { AccountDefinition, CacheSchema } from '..';
import { ServerRegistry } from './server-registry';

export class AccountServer extends ServerRegistry<AccountDefinition> {
  /** Returns all the active accounts on the network */
  protected async _refresh(
    _network: Network
  ): Promise<CacheSchema<AccountDefinition>> {
    throw Error('Unimplemented');
  }
}
