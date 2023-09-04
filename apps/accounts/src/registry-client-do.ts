import { DurableObjectState } from '@cloudflare/workers-types';
import {
  Network,
  SETTLEMENT_RESERVE,
  convertToSignedfCashId,
  getNowSeconds,
} from '@notional-finance/util';
import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { BaseDO, MetricType } from '@notional-finance/durable-objects';
import { calculateAccountIRR } from './factors/calculations';
import { Env } from '.';

export class RegistryClientDO extends BaseDO<Env> {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env, 'registry-client');
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${network}`;
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

  async onRefresh(): Promise<void> {
    // no-op
  }

  override async healthcheck() {
    try {
      Registry.initialize(
        this.env.NX_DATA_URL,
        AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
        false
      );

      // First trigger a refresh for all supported networks
      await Promise.all(
        this.env.SUPPORTED_NETWORKS.map((network) => {
          if (network === Network.All) return Promise.resolve();
          return Registry.triggerRefresh(network);
        })
      );

      // Now run all metrics jobs
      for (const network of this.env.SUPPORTED_NETWORKS) {
        if (network === Network.All) continue;
        await this.checkDataFreshness(network);
        await this.checkAccountList(network);
        await this.checkTotalSupply(network);
        await this.saveAccountFactors(network);
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

  private async checkDataFreshness(network: Network) {
    const networkTag = `network:${network}`;
    const timestamp = getNowSeconds();
    const analyticsData = Registry.getAnalyticsRegistry()
      .getAllSubjectKeys(network)
      .map((k) => {
        const latestTimestamp = Math.max(
          ...(
            Registry.getAnalyticsRegistry().getLatestFromSubject(
              network,
              k,
              0
            ) || []
          ).map((d) => (d['timestamp'] || 0) as number)
        );

        return {
          metric: `registry.lastUpdateTimestamp`,
          points: [
            {
              value: timestamp - latestTimestamp,
              timestamp,
            },
          ],
          tags: [networkTag, `registry:analytics`, `view:${k}`],
          type: MetricType.Gauge,
        };
      });

    await this.logger.submitMetrics({
      series: [
        {
          metric: 'registry.lastUpdateTimestamp',
          points: [
            {
              value:
                timestamp -
                Registry.getTokenRegistry().getLastUpdateTimestamp(network),
              timestamp,
            },
          ],
          tags: [networkTag, 'registry:tokens'],
          type: MetricType.Gauge,
        },
        {
          metric: 'registry.lastUpdateTimestamp',
          points: [
            {
              value:
                timestamp -
                Registry.getOracleRegistry().getLastUpdateTimestamp(network),
              timestamp,
            },
          ],
          tags: [networkTag, 'registry:oracles'],
          type: MetricType.Gauge,
        },
        {
          metric: 'registry.lastUpdateTimestamp',
          points: [
            {
              value:
                timestamp -
                Registry.getVaultRegistry().getLastUpdateTimestamp(network),
              timestamp,
            },
          ],
          tags: [networkTag, 'registry:vaults'],
          type: MetricType.Gauge,
        },
        {
          metric: 'registry.lastUpdateTimestamp',
          points: [
            {
              value:
                timestamp -
                Registry.getExchangeRegistry().getLastUpdateTimestamp(network),
              timestamp,
            },
          ],
          tags: [networkTag, 'registry:exchanges'],
          type: MetricType.Gauge,
        },
        {
          metric: 'registry.lastUpdateTimestamp.configuration',
          points: [
            {
              value:
                timestamp -
                Registry.getConfigurationRegistry().getLastUpdateTimestamp(
                  network
                ),
              timestamp,
            },
          ],
          tags: [networkTag, 'registry:configuration'],
          type: MetricType.Gauge,
        },
      ].concat(analyticsData),
    });
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
          tags: [],
          text: `Account List mismatch detected ${a.address} is not in the account list`,
        });
      }

      const vaultKeys = a.balances
        .filter((b) => b.tokenType === 'VaultShare' && !b.isZero())
        .map((b) => `${a.address}:${b.vaultAddress}`.toLowerCase());
      for (const k of vaultKeys) {
        if (vaultAccountSet.has(k)) vaultAccountSet.delete(k);
        else {
          await this.logger.submitEvent({
            host: this.serviceName,
            network,
            aggregation_key: 'VaultAccountListMismatch',
            alert_type: 'error',
            title: `Vault Account List Mismatch: ${k}`,
            tags: [],
            text: `Vault Account List mismatch detected ${k} is not in the account list`,
          });
        }
      }
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

  private async saveAccountFactors(network: Network) {
    const accounts = Registry.getAccountRegistry();
    const allAccounts = accounts.getAllSubjectKeys(network);
    const allFactors = allAccounts
      .map((a) => accounts.getLatestFromSubject(network, a))
      .filter((acct) => acct.systemAccountType === 'None')
      .map((account) => ({
        address: account.address,
        ...calculateAccountIRR(account, undefined),
      }));

    // TODO: split the IRR factors against the risk factors
    // risk factors should be stored in a KV store
    await this.putStorageKey(network, JSON.stringify(allFactors));
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

        if (computedSupply.sub(totalSupply).abs().toFloat() > 1e-4) {
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
      const totalComputedBorrows = config
        .getVaultActiveMaturities(network, v.vaultAddress)
        .reduce((t, m) => {
          const { primaryDebtID } = config.getVaultIDs(
            network,
            v.vaultAddress,
            m
          );
          return t.add(
            totalBalances.get(primaryDebtID)?.toUnderlying() || t.copy(0)
          );
        }, TokenBalance.zero(totalUsedPrimaryBorrowCapacity.token));

      if (
        totalComputedBorrows
          .sub(totalUsedPrimaryBorrowCapacity)
          .abs()
          .toFloat() > 1e-4
      ) {
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
  }
}
