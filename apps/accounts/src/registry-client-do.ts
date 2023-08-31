import { DurableObjectState } from '@cloudflare/workers-types';
import {
  Network,
  convertToSignedfCashId,
  getNowSeconds,
} from '@notional-finance/util';
import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { APIEnv, BaseDO } from '@notional-finance/durable-objects';

export class RegistryClientDO extends BaseDO<APIEnv> {
  constructor(state: DurableObjectState, env: APIEnv) {
    super(state, env, 'registry-client');
  }

  getStorageKey(url: URL): string {
    const network = url.pathname.split('/')[1];
    if (!network) throw Error('Network Not Found');
    return `${this.serviceName}/${network}`;
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
          name: `registry.lastUpdateTimestamp.analytics.${k}`,
          value: latestTimestamp,
          tags: [network],
          timestamp: getNowSeconds(),
        };
      });

    await this.logger.submitMetrics({
      series: [
        {
          name: 'registry.lastUpdateTimestamp.tokens',
          value: Registry.getTokenRegistry().getLastUpdateTimestamp(network),
          tags: [network],
          timestamp: getNowSeconds(),
        },
        {
          name: 'registry.lastUpdateTimestamp.oracles',
          value: Registry.getOracleRegistry().getLastUpdateTimestamp(network),
          tags: [network],
          timestamp: getNowSeconds(),
        },
        {
          name: 'registry.lastUpdateTimestamp.vaults',
          value: Registry.getVaultRegistry().getLastUpdateTimestamp(network),
          tags: [network],
          timestamp: getNowSeconds(),
        },
        {
          name: 'registry.lastUpdateTimestamp.exchanges',
          value: Registry.getExchangeRegistry().getLastUpdateTimestamp(network),
          tags: [network],
          timestamp: getNowSeconds(),
        },
        {
          name: 'registry.lastUpdateTimestamp.configuration',
          value:
            Registry.getConfigurationRegistry().getLastUpdateTimestamp(network),
          tags: [network],
          timestamp: getNowSeconds(),
        },
      ].concat(analyticsData),
    });
  }

  private async checkAccountList(_network: Network) {
    // const accountList = Registry.getAnalyticsRegistry().getAllAccounts(network)
    // const subgraphAccounts = Registry.getAccountRegistry().getAllSubjectKeys(network)
  }

  private async saveAccountFactors(network: Network) {
    Registry.getAccountRegistry()
      .getAllSubjectKeys(network)
      .forEach((_a) => {
        return;
      });
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
    const totalBalances = accounts.getAllSubjectKeys(network).reduce((m, a) => {
      accounts.getLatestFromSubject(network, a).balances.forEach((_b) => {
        if (_b.tokenType === 'VaultDebt') {
          // Accumulate vault debt to check total borrow capacity
          m.set(
            _b.tokenId,
            (m.get(_b.tokenId) || TokenBalance.zero(_b.token)).add(_b.abs())
          );
        }

        const b = _b.unwrapVaultToken();
        const tokenId = convertToSignedfCashId(b.tokenId, b.isNegative());
        m.set(
          tokenId,
          (m.get(tokenId) || TokenBalance.fromID(0, tokenId, network)).add(
            TokenBalance.fromID(b.abs().n, tokenId, network)
          )
        );
      });

      return m;
    }, new Map<string, TokenBalance>());

    for (const token of tokens) {
      const { totalSupply, symbol } = token;
      if (totalSupply) {
        // All these balances are positive
        const computedSupply =
          totalBalances.get(totalSupply.tokenId) || TokenBalance.zero(token);

        if (computedSupply.sub(totalSupply).abs().toFloat() > 1e-4) {
          await this.logger.submitEvent({
            aggregation_key: 'TotalSupplyMismatch',
            alert_type: 'error',
            title: `Total Supply Mismatch: ${totalSupply.symbol}`,
            tags: [network, totalSupply.symbol],
            text: `
            Total Supply mismatch detected in ${totalSupply.symbol}:
            Total Supply: ${totalSupply.toString()}
            Computed Total Supply: ${computedSupply.toString()}
            `,
          });
        }
      } else {
        await this.logger.submitEvent({
          aggregation_key: 'TotalSupplyMissing',
          alert_type: 'warning',
          title: `Total Supply Missing: ${symbol}`,
          tags: [network, symbol],
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
