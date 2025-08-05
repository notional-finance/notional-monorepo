import { ACCOUNT_ID_RANGES, Network } from '@notional-finance/util';
import {
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from '../../server/server-registry';
import { AccountDefinition } from '../../Definitions';
import { ExecutionResult } from 'graphql';
import { parseGraphBalanceToTokenBalance } from './balance-statement';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AllAccountsQuery } from '../../.graphclient';

export async function fetchBatchAccounts(
  network: Network,
  subgraphApiKey: string
) {
  const { AllAccountsDocument } = await loadGraphClientDeferred();

  const accountData: AccountDefinition[] = [];
  for (let i = 0; i < ACCOUNT_ID_RANGES.length - 1; i++) {
    const results = await fetchGraphPaginate(
      network,
      AllAccountsDocument,
      'accounts',
      subgraphApiKey,
      {
        skip: 0,
        startId: ACCOUNT_ID_RANGES[i],
        endId: ACCOUNT_ID_RANGES[i + 1],
      },
      750
    );

    (results as ExecutionResult<AllAccountsQuery>).data?.accounts.forEach(
      (a) => {
        accountData.push({
          address: a.id,
          network,
          balances:
            a.balances?.map((b) =>
              parseGraphBalanceToTokenBalance(
                b.current.currentBalance,
                b.token.id,
                network
              )
            ) || [],
        } as AccountDefinition);
      }
    );
  }

  return accountData;
}
