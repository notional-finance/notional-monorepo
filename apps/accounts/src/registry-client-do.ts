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

  private async checkAccountList(network: Network) {
    const accountList = await Registry.getAnalyticsRegistry().getView<{
      account_id: string;
      vault_id: string | null;
    }>(network, 'accounts_list');
    const accountSet = new Set(
      accountList
        .filter(({ vault_id }) => vault_id === null)
        .map(({ account_id }) => account_id.toLowerCase())
    );
    const vaultAccountSet = new Set(
      accountList
        .filter(({ vault_id }) => vault_id !== null)
        .map(({ account_id, vault_id }) =>
          `${account_id}:${vault_id}`.toLowerCase()
        )
    );
    // NOTE: this includes accounts with only NOTE tokens
    const subgraphAccounts = Registry.getAccountRegistry()
      .getAllSubjectKeys(network)
      .map((a) =>
        Registry.getAccountRegistry().getLatestFromSubject(network, a)
      )
      .filter((acct) => !!acct)
      .filter((acct) => acct.systemAccountType === 'None');

    let accountsMissingInList = 0;
    let vaultAccountsMissingInList = 0;
    for (const a of subgraphAccounts) {
      if (accountSet.has(a.address.toLowerCase())) {
        accountSet.delete(a.address.toLowerCase());
      } else {
        accountsMissingInList += 1;
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'AccountListMismatch',
          alert_type: 'error',
          title: `Account List Mismatch: ${a.address}`,
          tags: [`network:${network}`],
          text: `Account List mismatch detected ${a.address} is not in the account list`,
        });
      }

      const vaultKeys = unique(
        a.balances
          .filter((b) => b.tokenType === 'VaultShare')
          .map((b) => `${a.address}:${b.vaultAddress}`.toLowerCase())
      );
      for (const k of vaultKeys) {
        if (vaultAccountSet.has(k)) vaultAccountSet.delete(k);
        else {
          vaultAccountsMissingInList += 1;
          await this.logger.submitEvent({
            host: this.serviceName,
            network,
            aggregation_key: 'VaultAccountListMismatch',
            alert_type: 'error',
            title: `Vault Account List Mismatch: ${k}`,
            tags: [`network:${network}`],
            text: `Vault Account List mismatch detected ${k} is not in the account list`,
          });
        }
      }

      // TODO: check that the account does not have any vault positions
      // that we do not know about...so call directly on chain for every
      // listed vault
    }

    if (accountSet.size > 0) {
      await this.logger.submitEvent({
        host: this.serviceName,
        network,
        aggregation_key: 'AccountListMismatch',
        alert_type: 'error',
        title: `Account List Mismatch`,
        tags: [],
        text: `Account List mismatch detected (missing in subgraph) ${
          accountSet.size
        }: ${[...accountSet.entries()].toString()}`,
      });
    }

    if (vaultAccountSet.size > 0) {
      await this.logger.submitEvent({
        host: this.serviceName,
        network,
        aggregation_key: 'VaultAccountListMismatch',
        alert_type: 'error',
        title: `Vault Account List Mismatch`,
        tags: [],
        text: `Vault Account List mismatch detected (missing in subgraph) ${
          vaultAccountSet.size
        }: ${[
          ...vaultAccountSet.entries(),
        ].toString()} is not in the subgraph list`,
      });
    }

    await this.logger.submitMetrics({
      series: [
        {
          metric: 'reconciliation.accounts.missing_in_list',
          points: [
            {
              value: accountsMissingInList,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
        {
          metric: 'reconciliation.accounts.missing_in_subgraph',
          points: [
            {
              value: accountSet.size,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
        {
          metric: 'reconciliation.vault_accounts.missing_in_list',
          points: [
            {
              value: vaultAccountsMissingInList,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
        {
          metric: 'reconciliation.vault_accounts.missing_in_subgraph',
          points: [
            {
              value: vaultAccountSet.size,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
      ],
    });
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

  private async checkTotalSupply(network: Network) {
    const tokens = Registry.getTokenRegistry()
      .getAllTokens(network)
      .filter(
        (t) =>
          !!t.currencyId &&
          t.tokenType !== 'Underlying' &&
          t.tokenType !== 'VaultCash' &&
          t.tokenType !== 'VaultDebt'
      );

    const accounts = Registry.getAccountRegistry();
    const maturedBalances = new Map<string, TokenBalance>();
    const totalBalances = accounts.getAllSubjectKeys(network).reduce((m, a) => {
      (
        accounts.getLatestFromSubject(network, a) as AccountDefinition
      ).balances.forEach((_b) => {
        if (_b.isZero()) return m;

        if (_b.tokenType === 'VaultDebt') {
          // Accumulate vault debt to check total borrow capacity
          m.set(
            _b.tokenId,
            (m.get(_b.tokenId) || TokenBalance.zero(_b.token)).add(_b.abs())
          );
        }

        let b = _b.unwrapVaultToken();
        // Vault debt is positively signed when returned in this method
        if (_b.tokenType === 'VaultDebt' && _b.isPositive()) b = b.neg();

        const tokenId = convertToSignedfCashId(b.tokenId, b.isNegative());

        if (b.tokenType === 'fCash' && b.maturity <= getNowSeconds()) {
          // If the fCash is matured, then don't add to computed total balances. The total
          // value of settled fCash is already added to prime supply and debt at market
          // initialization. We check that matured value is equal to the value held in the
          // settlement reserve.
          const maturedValue = b.isNegative()
            ? b.toPrimeDebt()
            : b.toPrimeCash();

          maturedBalances.set(
            maturedValue.tokenId,
            (
              maturedBalances.get(maturedValue.tokenId) || maturedValue.copy(0)
            ).add(maturedValue.abs())
          );
        } else {
          m.set(
            tokenId,
            (m.get(tokenId) || TokenBalance.fromID(0, tokenId, network)).add(
              TokenBalance.fromID(b.n, tokenId, network).abs()
            )
          );
        }
      });

      return m;
    }, new Map<string, TokenBalance>());

    const settlementReserveBalances = (
      accounts.getLatestFromSubject(
        network,
        SETTLEMENT_RESERVE
      ) as AccountDefinition
    ).balances;
    const pCashpDebt = tokens.filter(
      (t) => t.tokenType === 'PrimeCash' || t.tokenType === 'PrimeDebt'
    );
    const series: DDMetric[] = [];

    for (const token of pCashpDebt) {
      const computedBalance =
        maturedBalances.get(token.id) || TokenBalance.zero(token);
      const reserveBalance =
        settlementReserveBalances.find((b) => b.tokenId === token.id) ||
        TokenBalance.zero(token);

      series.push({
        metric: 'reconciliation.settlement.reserve_balance',
        points: [
          {
            value: reserveBalance.abs().toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `token:${token.symbol}`],
        type: MetricType.Gauge,
      });
      series.push({
        metric: 'reconciliation.settlement.computed_reserve_balance',
        points: [
          {
            value: computedBalance.abs().toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `token:${token.symbol}`],
        type: MetricType.Gauge,
      });

      if (computedBalance.sub(reserveBalance.abs()).abs().toFloat() > 1e-4) {
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'SettlementReserveMismatch',
          alert_type: 'error',
          title: `SettlementReserve Mismatch: ${token.symbol}`,
          tags: [],
          text: `
            Settlement Reserve mismatch detected in ${token.symbol}:
            Settlement Reserve: ${reserveBalance.toString()}
            Computed Reserve: ${computedBalance.toString()}
            `,
        });
      }
    }

    for (const token of tokens) {
      const { totalSupply, symbol, isFCashDebt, id } = token;
      if (totalSupply) {
        // All these balances are positive
        const computedSupply =
          totalBalances.get(id) || TokenBalance.zero(token);
        // Use a smaller lower bound for 6 decimal tokens like USDC and USDT since
        // they succumb to more rounding errors than other tokens.
        const lowerBound = totalSupply.underlying.decimals < 8 ? 1e-2 : 1e-4;

        series.push({
          metric: 'reconciliation.total_supply.supply_balance',
          points: [
            {
              value: totalSupply.abs().toFloat(),
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`, `token:${token.symbol}`],
          type: MetricType.Gauge,
        });
        series.push({
          metric: 'reconciliation.total_supply.computed_supply_balance',
          points: [
            {
              value: computedSupply.abs().toFloat(),
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`, `token:${token.symbol}`],
          type: MetricType.Gauge,
        });

        if (computedSupply.sub(totalSupply).abs().toFloat() > lowerBound) {
          await this.logger.submitEvent({
            host: this.serviceName,
            network,
            aggregation_key: 'TotalSupplyMismatch',
            alert_type: 'error',
            title: `Total Supply Mismatch: ${isFCashDebt ? '-' : ''}${
              totalSupply.symbol
            }`,
            tags: [],
            text: `
            Total Supply mismatch detected in ${isFCashDebt ? '-' : ''}${
              totalSupply.symbol
            }:
            Total Supply: ${totalSupply.toString()}
            Computed Total Supply: ${computedSupply.toString()}
            `,
          });
        }
      } else {
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'TotalSupplyMissing',
          alert_type: 'warning',
          title: `Total Supply Missing: ${symbol}`,
          tags: [],
          text: `Total Supply missing for ${symbol}`,
        });
      }
    }

    const config = Registry.getConfigurationRegistry();
    const allVaults = config.getAllListedVaults(network) || [];
    for (const v of allVaults) {
      const { totalUsedPrimaryBorrowCapacity } = config.getVaultCapacity(
        network,
        v.vaultAddress
      );
      const totalComputedBorrows = Array.from(totalBalances.keys())
        .filter((k) => isERC1155Id(k))
        .filter((k) => {
          const { vaultAddress, assetType } = decodeERC1155Id(k);
          return (
            vaultAddress === v.vaultAddress &&
            assetType === AssetType.VAULT_DEBT_ASSET_TYPE
          );
        })
        .reduce((t, k) => {
          const b = totalBalances.get(k) as TokenBalance;
          if (b.maturity === PRIME_CASH_VAULT_MATURITY) {
            return t.add(b.toUnderlying() || t.copy(0));
          } else {
            // fCash is added to borrow capacity at the notional value
            return t.add(t.copy(b.scaleTo(t.decimals) || 0));
          }
        }, TokenBalance.zero(totalUsedPrimaryBorrowCapacity.token));

      series.push({
        metric: 'reconciliation.vault_capacity.total_capacity',
        points: [
          {
            value: totalUsedPrimaryBorrowCapacity.abs().toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `vault:${v.vaultAddress}`],
        type: MetricType.Gauge,
      });
      series.push({
        metric: 'reconciliation.vault_capacity.computed_capacity',
        points: [
          {
            value: totalComputedBorrows.abs().toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `vault:${v.vaultAddress}`],
        type: MetricType.Gauge,
      });

      if (
        totalComputedBorrows
          .sub(totalUsedPrimaryBorrowCapacity)
          .abs()
          .toFloat() > 1e-4
      ) {
        // NOTE: this will throw an error if the vault is not settled
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'TotalBorrowCapacityMismatch',
          alert_type: 'error',
          title: `Total Borrow Capacity Mismatch: ${v.vaultAddress}`,
          tags: [network, v.vaultAddress],
          text: `
            Total Borrow Capacity mismatch detected in ${v.vaultAddress}:
            Total Capacity Used: ${totalUsedPrimaryBorrowCapacity.toString()}
            Computed Capacity Used: ${totalComputedBorrows.toString()}
            `,
        });
      }
    }
    const data = (await Registry.getAnalyticsRegistry().getView(
      network,
      'ExternalLendingHistory'
    )) as unknown as ExternalLendingHistoryQuery;

    for (const e of data.externalLendings) {
      const underlyingHeld = TokenBalance.fromID(
        // Takes the most recent underlying snapshot
        e.underlyingSnapshots?.shift()?.storedBalanceOf || 0,
        e.underlying.id,
        network
      ).add(
        TokenBalance.fromID(
          // Takes the most recent external lending snapshot
          e.externalSnapshots?.shift()?.storedBalanceOfUnderlying || 0,
          e.underlying.id,
          network
        )
      );

      const pCash = Registry.getTokenRegistry().getPrimeCash(
        network,
        underlyingHeld.currencyId
      );
      const pDebt = Registry.getTokenRegistry().getPrimeDebt(
        network,
        underlyingHeld.currencyId
      );
      if (!pCash.totalSupply || !pDebt.totalSupply)
        throw Error(`Total Supply for ${underlyingHeld.symbol} not found`);

      const expectedUnderlying = pCash.totalSupply
        ?.toUnderlying()
        .sub(pDebt.totalSupply?.toUnderlying());

      series.push({
        metric: 'reconciliation.prime_cash.expected_underlying',
        points: [
          {
            value: expectedUnderlying.abs().toFiat('USD').toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
        type: MetricType.Gauge,
      });

      series.push({
        metric: 'reconciliation.prime_cash.computed_computed_underlying',
        points: [
          {
            value: underlyingHeld.abs().toFiat('USD').toFloat(),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
        type: MetricType.Gauge,
      });

      if (e.underlyingSnapshots) {
        const u = firstValue(e.underlyingSnapshots);
        const storedBalanceOf = u?.storedBalanceOf
          ? TokenBalance.from(u.storedBalanceOf, expectedUnderlying.token)
          : undefined;
        const balanceOf = u?.balanceOf
          ? TokenBalance.from(u.balanceOf, expectedUnderlying.token)
          : undefined;

        // Used to check that the balanceOf and storedBalanceOf are in agreement
        series.push(
          {
            metric: 'reconciliation.underlying.stored_balance_of',
            points: [
              {
                value: storedBalanceOf?.toFloat() || 0,
                timestamp: getNowSeconds(),
              },
            ],
            tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
            type: MetricType.Gauge,
          },
          {
            metric: 'reconciliation.underlying.balance_of',
            points: [
              {
                value: balanceOf?.toFloat() || 0,
                timestamp: getNowSeconds(),
              },
            ],
            tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
            type: MetricType.Gauge,
          }
        );
      }

      if (e.externalSnapshots?.length) {
        const u = firstValue(e.externalSnapshots);
        const storedBalanceOf = u?.storedBalanceOfUnderlying
          ? TokenBalance.from(
              u.storedBalanceOfUnderlying,
              expectedUnderlying.token
            )
          : undefined;
        const balanceOf = u?.balanceOf
          ? TokenBalance.from(u.balanceOf, expectedUnderlying.token)
          : undefined;

        series.push(
          {
            metric: 'reconciliation.external_lending.stored_balance_of',
            points: [
              {
                value: storedBalanceOf?.toFloat() || 0,
                timestamp: getNowSeconds(),
              },
            ],
            tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
            type: MetricType.Gauge,
          },
          {
            metric: 'reconciliation.external_lending.balance_of',
            points: [
              {
                value: balanceOf?.toFloat() || 0,
                timestamp: getNowSeconds(),
              },
            ],
            tags: [`network:${network}`, `token:${underlyingHeld.symbol}`],
            type: MetricType.Gauge,
          }
        );
      }

      if (expectedUnderlying.gt(underlyingHeld)) {
        await this.logger.submitEvent({
          host: this.serviceName,
          network,
          aggregation_key: 'PrimeCashInvariant',
          alert_type: 'error',
          title: `Prime Cash Invariant: ${underlyingHeld.symbol}`,
          tags: [network],
          text: `
            Prime Cash Invariant mismatch detected in ${underlyingHeld.symbol}
            Total Prime Supply: ${pCash.totalSupply?.toString()}
            Total Prime Debt: ${pDebt.totalSupply?.toString()}
            Total Underlying Held: ${underlyingHeld.toString()}
            Expected Underlying Held: ${expectedUnderlying.toString()}
            `,
        });
      }
    }

    await this.logger.submitMetrics({ series });
  }

  private async monitorRelayerBalances(network: Network) {
    const provider = getProviderFromNetwork(network, true);
    const liquidatorBalance = await provider.getBalance(
      '0xBCf0fa01AB57c6E8ab322518Ad1b4b86778f08E1'
    );
    const rewarderBalance = await provider.getBalance(
      '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed'
    );

    const series = [
      {
        metric: 'relayer.balance',
        points: [
          {
            value: parseFloat(ethers.utils.formatUnits(liquidatorBalance, 18)),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `relayer:liquidator`],
        type: MetricType.Gauge,
      },
      {
        metric: 'relayer.balance',
        points: [
          {
            value: parseFloat(ethers.utils.formatUnits(rewarderBalance, 18)),
            timestamp: getNowSeconds(),
          },
        ],
        tags: [`network:${network}`, `relayer:rewarder`],
        type: MetricType.Gauge,
      },
    ];

    await this.logger.submitMetrics({ series });
  }

  private async checkSubgraphBlockNumber(network: Network) {
    const meta = (await Registry.getAnalyticsRegistry().getView(
      network,
      'SubgraphMeta'
    )) as unknown as MetaQuery;

    await this.logger.submitMetrics({
      series: [
        {
          metric: 'monitoring.subgraph.update_time',
          points: [
            {
              value: getNowSeconds() - (meta._meta?.block.timestamp || 0),
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
      ],
    });

    if (
      !meta._meta?.block.timestamp ||
      meta._meta.block.timestamp < getNowSeconds() - 2 * SECONDS_IN_HOUR
    ) {
      const networkTag = `network:${network}`;
      const hours =
        (getNowSeconds() - (meta._meta?.block.timestamp || 0)) /
        SECONDS_IN_HOUR;

      await this.logger.submitEvent({
        host: this.serviceName,
        network,
        aggregation_key: 'MonitoringCheckFailed',
        alert_type: 'error',
        title: `Monitor Subgraph Block Height Failed: ${network}`,
        tags: [networkTag, `monitor:subgraph_block_height`],
        text: `Subgraph Block Height on ${network} is trailing by ${hours.toFixed(
          2
        )}`,
      });
    }
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

  private async checkRiskServiceUpdates(network: Network) {
    const vaultRisk = await this.env.VIEW_CACHE_R2.head(
      `${network}/accounts/vaultRisk`
    );
    const portfolioRisk = await this.env.VIEW_CACHE_R2.head(
      `${network}/accounts/portfolioRisk`
    );
    if (!vaultRisk || !portfolioRisk) {
      throw new Error(
        `checkRiskServiceUpdates failed to get vaultRisk or portfolioRisk`
      );
    }
    const lastUpdated = Math.min(
      vaultRisk.uploaded.getTime() / 1000,
      portfolioRisk.uploaded.getTime() / 1000
    );
    await this.logger.submitMetrics({
      series: [
        {
          metric: 'monitoring.risk_service.update_time',
          points: [
            {
              value: getNowSeconds() - lastUpdated,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
      ],
    });

    if (lastUpdated < getNowSeconds() - SECONDS_IN_HOUR / 2) {
      const networkTag = `network:${network}`;
      await this.logger.submitEvent({
        host: this.serviceName,
        network,
        aggregation_key: 'MonitoringCheckFailed',
        alert_type: 'error',
        title: `Risk Service Updates Lagging: ${network}`,
        tags: [networkTag, `monitor:risk_service_updates`],
        text: `Risk Service Updates on ${network} is trailing by ${(
          (getNowSeconds() - lastUpdated) /
          60
        ).toFixed(2)} minutes`,
      });
    }
  }

  private async saveYieldData(network: Network) {
    const allYields = Registry.getYieldRegistry().getAllYields(network);
    await this.putStorageKey(`${network}/yields`, JSON.stringify(allYields));
    await this.logger.submitMetrics({
      series: [
        {
          metric: 'registry.data.yields',
          points: [
            {
              value: allYields.length,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [`network:${network}`],
          type: MetricType.Gauge,
        },
      ],
    });
  }

  private async saveTotalsData() {
    const kpi = Registry.getAnalyticsRegistry().getKPIs();
    await this.putStorageKey(`all/kpi`, JSON.stringify(kpi));

    await this.logger.submitMetrics({
      series: [
        {
          metric: 'monitoring.kpi.total_deposits',
          points: [
            {
              value: kpi.totalDeposits,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [],
          type: MetricType.Gauge,
        },
        {
          metric: 'monitoring.kpi.open_debt',
          points: [
            {
              value: kpi.totalOpenDebt,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [],
          type: MetricType.Gauge,
        },
        {
          metric: 'monitoring.kpi.total_accounts',
          points: [
            {
              value: kpi.totalAccounts,
              timestamp: getNowSeconds(),
            },
          ],
          tags: [],
          type: MetricType.Gauge,
        },
      ],
    });
  }

  private async checkVaultReinvestments(network: Network) {
    const reinvestments =
      Registry.getAnalyticsRegistry().getVaultReinvestments(network);
    const oneHourAgo = getNowSeconds() - SECONDS_IN_HOUR;
    const config = Registry.getConfigurationRegistry();

    for (const [vaultAddress, reinvestmentList] of Object.entries(
      reinvestments
    )) {
      for (const reinvestment of reinvestmentList) {
        if (reinvestment.timestamp < oneHourAgo) continue;
        const vault = config.getVaultConfig(network, vaultAddress);
        const rewardToken = Registry.getTokenRegistry().getTokenByID(
          network,
          reinvestment.rewardTokenSold.id
        );
        const borrowCurrency = Registry.getTokenRegistry().getTokenByID(
          network,
          vault.primaryBorrowCurrency.id
        );

        // Calculate the price that the reward token was sold for
        const amountSold = TokenBalance.from(
          reinvestment.rewardAmountSold,
          rewardToken
        );
        const amountReceived = TokenBalance.from(
          reinvestment.underlyingAmountRealized || 0,
          borrowCurrency
        );
        const calculatedPrice = amountReceived.toFloat() / amountSold.toFloat();

        // Fetch the price from DeFi Llama
        const defiLlamaPrice = await this.fetchPriceFromDeFiLlama(
          network,
          rewardToken.id,
          borrowCurrency.id,
          reinvestment.timestamp
        );

        // Calculate the difference as a percentage
        const priceDifference =
          Math.abs((calculatedPrice - defiLlamaPrice) / defiLlamaPrice) * 100;

        // Log metrics
        await this.logger.submitMetrics({
          series: [
            {
              metric: 'vault.reinvestment.calculated_price',
              points: [{ value: calculatedPrice, timestamp: getNowSeconds() }],
              tags: [
                `network:${network}`,
                `vault:${vaultAddress}`,
                `reward_token:${rewardToken.symbol}`,
              ],
              type: MetricType.Gauge,
            },
            {
              metric: 'vault.reinvestment.defi_llama_price',
              points: [{ value: defiLlamaPrice, timestamp: getNowSeconds() }],
              tags: [
                `network:${network}`,
                `vault:${vaultAddress}`,
                `reward_token:${rewardToken.symbol}`,
              ],
              type: MetricType.Gauge,
            },
            {
              metric: 'vault.reinvestment.price_difference_percentage',
              points: [{ value: priceDifference, timestamp: getNowSeconds() }],
              tags: [
                `network:${network}`,
                `vault:${vaultAddress}`,
                `reward_token:${rewardToken.symbol}`,
              ],
              type: MetricType.Gauge,
            },
          ],
        });
      }
    }
  }

  private async fetchPriceFromDeFiLlama(
    network: Network,
    baseToken: string,
    quoteToken: string,
    timestamp: number
  ): Promise<number> {
    const baseTokenId = `${
      network === 'mainnet' ? 'ethereum' : network
    }:${baseToken}`;
    const quoteTokenId = `${
      network === 'mainnet' ? 'ethereum' : network
    }:${quoteToken}`;
    const url = `https://coins.llama.fi/prices/historical/${timestamp}/${baseTokenId},${quoteTokenId}`;
    const response = await fetch(url);
    const data: {
      coins: {
        [key: string]: {
          price: number;
          timestamp: number;
          confidence: number;
        };
      };
    } = await response.json();
    const basePrice = data.coins[baseTokenId].price;
    const quotePrice = data.coins[quoteTokenId].price;

    return basePrice / quotePrice;
  }
}
