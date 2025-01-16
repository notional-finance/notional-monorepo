import { DurableObject } from 'cloudflare:workers';
import {
  AssetType,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_HOUR,
  SETTLEMENT_RESERVE,
  convertToSignedfCashId,
  decodeERC1155Id,
  firstValue,
  getNowSeconds,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
  isERC1155Id,
  unique,
} from '@notional-finance/util';
import {
  AccountDefinition,
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { DDMetric, Logger, MetricType } from '@notional-finance/util';
import {
  calculateAccountIRR,
  // currentContestId,
  excludedAccounts,
} from './factors/calculations';
import { Env } from '.';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  ExternalLendingHistoryQuery,
  MetaQuery,
} from 'packages/core-entities/src/.graphclient';
import { ethers } from 'ethers';

export class RegistryClientDO extends DurableObject {
  protected serviceName: string;
  protected env: Env;
  protected logger: Logger;

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.serviceName = 'registry-client';
    this.env = env;
    const version = `${env.NX_COMMIT_REF?.substring(0, 8) ?? 'local'}`;
    this.logger = new Logger({
      service: this.serviceName,
      version: version,
      env: env.NX_ENV,
      apiKey: env.NX_DD_API_KEY,
    });
  }

  getStorageKey(url: URL): string {
    return url.pathname.slice(1);
  }

  async getDataKey(key: string) {
    return this.env.VIEW_CACHE_R2.get(key).then((d) =>
      (d as R2ObjectBody).json()
    );
  }

  async putStorageKey(key: string, data: string) {
    await this.env.VIEW_CACHE_R2.put(key, data);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/healthcheck') {
      return this.healthcheck();
    }

    try {
      const storageKey = this.getStorageKey(url);

      // Only accept get requests
      if (request.method === 'GET') {
        const data = await this.getDataKey(storageKey);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (e) {
      return new Response((e as Error).toString(), { status: 500 });
    }

    return new Response('Not Found', { status: 404 });
  }

  async _init() {
    Registry.initialize(
      this.env,
      this.env.NX_REGISTRY_URL,
      AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
      false,
      true,
      false
    );
    Registry.getAccountRegistry().setSubgraphAPIKey =
      this.env.NX_SUBGRAPH_API_KEY;

    // First trigger a refresh for all supported networks
    await Promise.all(
      this.env.SUPPORTED_NETWORKS.map((network) => {
        if (network === Network.all) return Promise.resolve();
        return Registry.triggerRefresh(network);
      })
    );
  }

  async healthcheck() {
    try {
      await this._init();

      // Now run all metrics jobs
      for (const network of this.env.SUPPORTED_NETWORKS) {
        if (network === Network.all) continue;
        await Promise.all([
          this.checkAccountList(network),
          this.checkTotalSupply(network),
          this.saveYieldData(network),
          this.monitorRelayerBalances(network),
          this.checkSubgraphBlockNumber(network),
          this.checkRiskServiceUpdates(network),
          this.checkVaultReinvestments(network),
        ]);

        if (network === Network.arbitrum) {
          // await this.checkDBMonitors(network);
          // await this.saveContestIRR(network, currentContestId);
        }
      }
      await this.saveTotalsData();

      return new Response('Ok', { status: 200 });
    } catch (error) {
      console.log(this.serviceName, error);
      this.logger.log({
        level: 'error',
        message: (error as Error).toString(),
      });
      return new Response('500', { status: 500 });
    }
  }


  private async getContestParticipants(contestId: number) {
    const providerURL = getProviderURLFromNetwork(Network.arbitrum, true);
    const participants = new Array<{
      address: string;
      communityId: number;
      contestId: number;
    }>();
    let nextToken: string | null = '0';
    do {
      const url = `${providerURL}/getNFTsForCollection?contractAddress=0xbBEF91111E9Db19E688B495972418D8ebC11F008&withMetadata=false&limit=100&startToken=${nextToken}`;
      let nfts: { id: { tokenId: string } }[];
      try {
        const response = (await fetch(url)) as Response;

        const data = await response.json<{
          nextToken: string | null;
          nfts: { id: { tokenId: string } }[];
        }>();
        ({ nfts, nextToken } = data);

        nfts.forEach(({ id: { tokenId } }) => {
          // Generate the hex without the 0x prefix
          const id = parseInt(tokenId.slice(18, 22), 16);
          if (id === contestId) {
            participants.push({
              address: `0x${tokenId.slice(26)}`,
              communityId: parseInt(tokenId.slice(22, 26), 16),
              contestId,
            });
          }
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    } while (nextToken);

    return participants;
  }

  private async saveContestIRR(network: Network, contestId: number) {
    const participants = await this.getContestParticipants(contestId);
    const accounts = Registry.getAccountRegistry();
    const allContestants = participants
      // .filter((a) => a.address === '0xc3c8476ebe9f8cb776bcd18fac10eb203754a78a')
      .filter((a) => !excludedAccounts.includes(a.address))
      .map((p) => {
        try {
          const account = accounts.getLatestFromSubject(network, p.address);
          return {
            ...p,
            ...calculateAccountIRR(account as AccountDefinition),
          };
        } catch {
          return undefined;
        }
      })
      .filter((_) => !!_)
      // NOTE: put a cap on IRR to exclude obviously incorrect values
      .filter(({ irr }) => irr === null || irr < 5);

    await this.putStorageKey(
      `${network}/accounts/contestResults`,
      JSON.stringify(allContestants)
    );
  }


  private async checkDBMonitors(network: Network) {
    const analytics = Registry.getAnalyticsRegistry();
    const monitoringViews = [
      'monitoring_chainlink_price_updates',
      'monitoring_fcash_rates',
      'monitoring_ntoken_value',
      'monitoring_pcash_and_pdebt_exchange_rate_monotonicity',
      // 'monitoring_tvl', Turned off temporarily
      'monitoring_vault_share_value',
      'monitoring_vault_reinvestments',
    ];

    const networkTag = `network:${network}`;
    const viewLengthSeries: any[] = [];

    for (const m of monitoringViews) {
      const data = (await analytics.getView(network, m)) as any[];
      viewLengthSeries.push({
        metric: 'registry.monitoring.length',
        points: [
          {
            value: data.length,
            timestamp: getNowSeconds(),
          },
        ],
        tags: [networkTag, `monitor:${m}`],
        type: MetricType.Gauge,
      });

      const isLagging = !data.every(
        (d) =>
          (d['timestamp'] || d['current_timestamp']) >
          getNowSeconds() - 3 * 3600
      );

      if (isLagging) {
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'MonitoringCheckLagging',
          alert_type: 'error',
          title: `Monitor ${m} Lagging`,
          tags: [networkTag, `monitor:${m}`],
          text: `Monitor ${m} is lagging by more than 3 hours`,
        });
      }

      for (const d of data) {
        const checkPassed = Object.keys(d)
          .filter((k) => k.endsWith('_check'))
          .every((k) => d[k]);
        if (!checkPassed) {
          const text = Object.keys(d)
            .map((k) => `${k}: ${d[k]}`)
            .join('\n');

          await this.logger.submitEvent({
            host: this.serviceName,
            network,
            aggregation_key: 'MonitoringCheckFailed',
            alert_type: 'error',
            title: `Monitor ${m} Failed`,
            tags: [networkTag, `monitor:${m}`],
            text,
          });
        }
      }
    }

    await this.logger.submitMetrics({ series: viewLengthSeries });
  }


}
