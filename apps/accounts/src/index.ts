import { Network, getNowSeconds } from '@notional-finance/util';
import { RegistryClientDO } from './registry-client-do';
import { Registry, AccountFetchMode } from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
export { RegistryClientDO } from './registry-client-do';

export interface Env {
  REGISTRY_CLIENT_DO: DurableObjectNamespace;
  VERSION: string;
  NX_ENV: string;
  NX_DATA_URL: string;
  NX_COMMIT_REF: string;
  NX_DD_API_KEY: string;
  SUPPORTED_NETWORKS: Network[];
  ACCOUNT_CACHE_R2: R2Bucket;
  AUTH_KEY: string;
  RISK_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (request.url.endsWith('/healthcheck') && authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    );
    return stub.fetch(request);
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    const stub = env.REGISTRY_CLIENT_DO.get(
      env.REGISTRY_CLIENT_DO.idFromName(env.VERSION)
    ) as unknown as RegistryClientDO;
    await stub.healthcheck();
    await env.RISK_QUEUE.send({
      timestamp: getNowSeconds(),
    });
  },
  async queue(_batch: MessageBatch, env: Env, _ctx: ExecutionContext) {
    Registry.initialize(
      env.NX_DATA_URL,
      AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
      false,
      true,
      false
    );
    console.log('Initialize');

    // First trigger a refresh for all supported networks
    await Promise.all(
      env.SUPPORTED_NETWORKS.map((network) => {
        if (network === Network.all) return Promise.resolve();
        console.log('Trigger Refresh');
        return Registry.triggerRefresh(network);
      })
    );
    console.log('Completed Refreshes');

    await Promise.all(
      env.SUPPORTED_NETWORKS.filter((n) => n !== Network.all).map(async (n) => {
        console.log('Save profile for', n);
        const results = saveAccountRiskProfiles(n);
        await env.ACCOUNT_CACHE_R2.put(
          `${n}/accounts/riskProfiles`,
          JSON.stringify(results)
        );
        console.log('Wrote Risk Profile for ', n);
      })
    );
  },
};

function saveAccountRiskProfiles(network: Network) {
  const accounts = Registry.getAccountRegistry()
    .getAllSubjectKeys(network)
    .map((a) => Registry.getAccountRegistry().getLatestFromSubject(network, a))
    .filter((account) => {
      // Only return accounts that have some balance
      return (
        account.systemAccountType === 'None' &&
        (account.balances.length > 0 ||
          !account.balances.every((b) => b.isZero()))
      );
    });
  console.log('Got all accounts', network);

  const riskProfiles = accounts
    .map((account) => {
      try {
        const accountRiskProfile = new AccountRiskProfile(
          account.balances,
          account.network
        );
        // const freeCollateralFactors =
        //   accountRiskProfile.freeCollateralFactors();
        // const hasCrossCurrencyRisk = freeCollateralFactors.some((e) =>
        //   e.totalAssetsLocal.add(e.totalDebtsLocal).isNegative()
        // );
        // const _riskFactors = accountRiskProfile.getAllRiskFactors();
        // const riskFactors = {
        //   ..._riskFactors,
        //   liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
        //     ...l,
        //     asset: l.asset.id,
        //   })),
        // };

        return {
          address: account.address,
          // riskFactors,
          // hasCrossCurrencyRisk,
          vaultRiskFactors: VaultAccountRiskProfile.getAllRiskProfiles(
            account
          ).map((v) => {
            const _riskFactors = v.getAllRiskFactors();
            const riskFactors = {
              ..._riskFactors,
              liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
                ...l,
                asset: l.asset.id,
              })),
            };
            return {
              vaultAddress: v.vaultAddress,
              riskFactors,
            };
          }),
        };
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })
    .filter((a) => a !== undefined);

  return riskProfiles;
}
