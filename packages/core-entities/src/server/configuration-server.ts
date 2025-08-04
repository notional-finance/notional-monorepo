import {
  DocumentTypes,
  fetchUsingGraph,
  loadGraphClientDeferred,
  ServerRegistry,
  TypedDocumentReturnType,
} from './server-registry';
import { Network } from '@notional-finance/util';

export type AllConfigurationQuery = {
  lendingRouters: TypedDocumentReturnType<
    DocumentTypes['AllLendingRoutersDocument']
  >;
  withdrawRequestManagers: TypedDocumentReturnType<
    DocumentTypes['AllWithdrawRequestManagersDocument']
  >;
};

export class ConfigurationServer extends ServerRegistry<AllConfigurationQuery> {
  /** Returns the all configuration query type as is, parsing will be done in the client */
  protected async _refresh(network: Network) {
    const { AllLendingRoutersDocument, AllWithdrawRequestManagersDocument } =
      await loadGraphClientDeferred();
    const lendingRouters = await fetchUsingGraph(
      network,
      AllLendingRoutersDocument,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY
    );
    const withdrawRequestManagers = await fetchUsingGraph(
      network,
      AllWithdrawRequestManagersDocument,
      (r) => {
        return { [network]: r };
      },
      this.env.NX_SUBGRAPH_API_KEY
    );

    return {
      ...lendingRouters,
      values: [
        [
          network,
          {
            lendingRouters: lendingRouters.values[network],
            withdrawRequestManagers: withdrawRequestManagers.values[network],
          },
        ] as [string, AllConfigurationQuery],
      ],
    };
  }
}
