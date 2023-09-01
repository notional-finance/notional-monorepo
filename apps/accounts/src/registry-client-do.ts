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
import { APIEnv, BaseDO } from '@notional-finance/durable-objects';
import { calculateAccountIRR } from './factors/calculations';

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
        // await this.checkDataFreshness(network);
        // await this.checkAccountList(network);
        // await this.checkTotalSupply(network);
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
    const accounts = Registry.getAccountRegistry();
    const allAccounts = accounts.getAllSubjectKeys(network);
    for (const a of allAccounts) {
      const account = accounts.getLatestFromSubject(network, a);
      if (account.systemAccountType !== 'None') continue;

      const { irr, totalNetWorth, netDeposits, earnings } = calculateAccountIRR(
        account,
        undefined
      );
      console.log(
        a,
        irr,
        totalNetWorth.toString(),
        netDeposits.toString(),
        earnings.toString()
      );
    }
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
          aggregation_key: 'SettlementReserveMismatch',
          alert_type: 'error',
          title: `SettlementReserve Mismatch: ${token.symbol}`,
          tags: [network, token.symbol],
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
            aggregation_key: 'TotalSupplyMismatch',
            alert_type: 'error',
            title: `Total Supply Mismatch: ${isFCashDebt ? '-' : ''}${
              totalSupply.symbol
            }`,
            tags: [network, totalSupply.symbol],
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
