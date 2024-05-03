import { DurableObject } from 'cloudflare:workers';
import {
  AssetType,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  SETTLEMENT_RESERVE,
  convertToSignedfCashId,
  decodeERC1155Id,
  getNowSeconds,
  getProviderURLFromNetwork,
  isERC1155Id,
  unique,
} from '@notional-finance/util';
import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Logger, MetricType } from '@notional-finance/durable-objects';
import {
  calculateAccountIRR,
  // currentContestId,
  excludedAccounts,
} from './factors/calculations';
import { Env } from '.';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ExternalLendingHistoryQuery } from 'packages/core-entities/src/.graphclient';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import zlib from 'zlib';

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

  async encodeGzip(data: string) {
    return await new Promise<string>((resolve, reject) => {
      zlib.gzip(Buffer.from(data, 'utf-8'), (err, result) => {
        if (err) reject(err);
        resolve(result.toString('base64'));
      });
    });
  }

  async parseGzip(data: string) {
    try {
      const unzipped = await new Promise<string>((resolve, reject) => {
        zlib.unzip(Buffer.from(data, 'base64'), (err, result) => {
          if (err) reject(err);
          resolve(result.toString('utf-8'));
        });
      });
      return JSON.parse(unzipped.toString() || '{}');
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  async getDataKey(key: string) {
    return this.env.ACCOUNT_CACHE_R2.get(key)
      .then((d) => d.text())
      .then((d) => this.parseGzip(d));
  }

  async putStorageKey(key: string, data: string) {
    const gz = await this.encodeGzip(data);
    await this.env.ACCOUNT_CACHE_R2.put(key, gz);
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

  async healthcheck() {
    try {
      Registry.initialize(
        this.env.NX_DATA_URL,
        AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
        false,
        true,
        false
      );

      // First trigger a refresh for all supported networks
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map((network) => {
          if (network === Network.all) return Promise.resolve();
          return Registry.triggerRefresh(network);
        })
      );

      // Now run all metrics jobs
      for (const network of this.env.SUPPORTED_NETWORKS) {
        if (network === Network.all) continue;
        await this.checkAccountList(network);
        await this.checkTotalSupply(network);
        await this.saveYieldData(network);
        if (network === Network.arbitrum) {
          // await this.checkDBMonitors(network);
          // await this.saveContestIRR(network, currentContestId);
        }
        // await this.saveAccountRiskProfiles(network);
      }

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
      .filter((acct) => acct.systemAccountType === 'None');
    for (const a of subgraphAccounts) {
      if (accountSet.has(a.address.toLowerCase())) {
        accountSet.delete(a.address.toLowerCase());
      } else {
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
        text: `Account List mismatch detected : ${[
          ...accountSet.entries(),
        ].toString()} is not in the subgraph list`,
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
        text: `Account List mismatch detected : ${[
          ...vaultAccountSet.entries(),
        ].toString()} is not in the subgraph list`,
      });
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
        const response = await fetch(url);

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
            ...calculateAccountIRR(account),
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

  public async saveAccountRiskProfiles(network: Network) {
    const accounts = Registry.getAccountRegistry()
      .getAllSubjectKeys(network)
      .map((a) =>
        Registry.getAccountRegistry().getLatestFromSubject(network, a)
      )
      .filter((acct) => acct.systemAccountType === 'None');

    const riskProfiles = accounts
      .filter((account) => {
        // Only return accounts that have some balance
        return (
          account.balances.length > 0 ||
          !account.balances.every((b) => b.isZero())
        );
      })
      .map((account) => {
        const accountRiskProfile = new AccountRiskProfile(
          account.balances,
          account.network
        );
        const freeCollateralFactors =
          accountRiskProfile.freeCollateralFactors();
        const hasCrossCurrencyRisk = freeCollateralFactors.some((e) =>
          e.totalAssetsLocal.add(e.totalDebtsLocal).isNegative()
        );
        const _riskFactors = accountRiskProfile.getAllRiskFactors();
        const riskFactors = {
          ..._riskFactors,
          liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
            ...l,
            asset: l.asset.id,
          })),
        };

        return {
          address: account.address,
          riskFactors,
          hasCrossCurrencyRisk,
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
      });

    await this.putStorageKey(
      `${network}/accounts/riskProfiles`,
      JSON.stringify(riskProfiles)
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
      accounts.getLatestFromSubject(network, a).balances.forEach((_b) => {
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

    const settlementReserveBalances = accounts.getLatestFromSubject(
      network,
      SETTLEMENT_RESERVE
    ).balances;
    const pCashpDebt = tokens.filter(
      (t) => t.tokenType === 'PrimeCash' || t.tokenType === 'PrimeDebt'
    );

    for (const token of pCashpDebt) {
      const computedBalance =
        maturedBalances.get(token.id) || TokenBalance.zero(token);
      const reserveBalance =
        settlementReserveBalances.find((b) => b.tokenId === token.id) ||
        TokenBalance.zero(token);

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
    const allVaults = config.getAllListedVaults(network);
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
          const b = totalBalances.get(k);
          if (b.maturity === PRIME_CASH_VAULT_MATURITY) {
            return t.add(b.toUnderlying() || t.copy(0));
          } else {
            // fCash is added to borrow capacity at the notional value
            return t.add(t.copy(b.scaleTo(t.decimals) || 0));
          }
        }, TokenBalance.zero(totalUsedPrimaryBorrowCapacity.token));

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
    const viewLengthSeries = [];

    for (const m of monitoringViews) {
      const data = await analytics.getView(network, m);
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
}
