import {
  AccountDefinition,
  getNetworkModel,
  TokenBalance,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  AssetType,
  convertToSignedfCashId,
  DDMetric,
  decodeERC1155Id,
  firstValue,
  getNowSeconds,
  getProviderFromNetwork,
  isERC1155Id,
  Logger,
  MetricType,
  Network,
  PRIME_CASH_VAULT_MATURITY,
  SECONDS_IN_HOUR,
  SETTLEMENT_RESERVE,
  SupportedNetworks,
  unique,
} from '@notional-finance/util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  ExternalLendingHistoryQuery,
  MetaQuery,
} from 'packages/core-entities/src/.graphclient';
import { ethers } from 'ethers';

const REGISTRY_URL = process.env['REGISTRY_URL'] as string;
const SUBGRAPH_API_KEY = process.env['SUBGRAPH_API_KEY'] as string;
const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID'] as string;
const SERVICE_NAME = 'risk-service';
const VERSION = 'v0.0.1';
const ENV = 'prod';
const DD_API_KEY = process.env['DD_API_KEY'] as string;

const logger = new Logger({
  service: SERVICE_NAME,
  version: VERSION,
  env: ENV,
  apiKey: DD_API_KEY,
});

let cachedS3Client: S3Client;
export function getS3() {
  const R2_ACCESS_KEY_ID = process.env['R2_ACCESS_KEY_ID'] as string;
  const R2_SECRET_ACCESS_KEY = process.env['R2_SECRET_ACCESS_KEY'] as string;

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedS3Client;
}

export async function calculateAccountRisks() {
  await Promise.all(
    SupportedNetworks.filter((n) => n !== Network.all).map(async (n) => {
      const { portfolioRiskProfiles, vaultRiskProfiles } =
        saveAccountRiskProfiles(accounts);
      try {
        await getS3().send(
          new PutObjectCommand({
            Bucket: 'view-cache-r2',
            Key: `${n}/accounts/portfolioRisk`,
            Body: JSON.stringify(portfolioRiskProfiles),
          })
        );
        await getS3().send(
          new PutObjectCommand({
            Bucket: 'view-cache-r2',
            Key: `${n}/accounts/vaultRisk`,
            Body: JSON.stringify(vaultRiskProfiles),
          })
        );
      } catch (e) {
        console.error(e);
      }
    })
  );
}

export async function executeMonitoring() {
  for (const network of SupportedNetworks) {
    if (network === Network.all) continue;
    // TODO: fetch the account list here
    await Promise.all([
      checkAccountList(network, accounts),
      checkTotalSupply(network, accounts),
      monitorRelayerBalances(network),
      checkSubgraphBlockNumber(network),
      checkRiskServiceUpdates(network),
      checkVaultReinvestments(network),
    ]);
  }
  await saveTotalsData();
}

function saveAccountRiskProfiles(accounts: AccountDefinition[]) {
  const vaultRiskProfiles: ReturnType<typeof getVaultRiskFactors> = [];

  const portfolioRiskProfiles = accounts
    .filter((account) => {
      // Only return accounts that have some balance
      return (
        account?.systemAccountType === 'None' &&
        (account.balances.length > 0 ||
          !account.balances.every((b) => b.isZero()))
      );
    })
    .map((account) => {
      try {
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
        const vaultRiskFactors = getVaultRiskFactors(account);

        if (vaultRiskFactors.length > 0) {
          vaultRiskProfiles.push(...vaultRiskFactors);
        }

        return {
          address: account.address,
          riskFactors,
          hasCrossCurrencyRisk,
        };
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })
    .filter((a) => a !== undefined);

  return { portfolioRiskProfiles, vaultRiskProfiles };
}

function getVaultRiskFactors(account: AccountDefinition) {
  const model = getNetworkModel(account.network);
  return (
    VaultAccountRiskProfile.getAllRiskProfiles(model, account)
      // Filter out empty vault accounts
      .filter((v) => !(v.vaultShares.isZero() && v.vaultDebt.isZero()))
      .map((v) => {
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
          vaultName: v.vaultConfig.name,
          account: account.address,
          riskFactors,
        };
      })
  );
}

async function checkAccountList(
  network: Network,
  accounts: AccountDefinition[]
) {
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
  const subgraphAccounts = accounts.filter(
    (acct) => acct.systemAccountType === 'None'
  );

  let accountsMissingInList = 0;
  let vaultAccountsMissingInList = 0;
  for (const a of subgraphAccounts) {
    if (accountSet.has(a.address.toLowerCase())) {
      accountSet.delete(a.address.toLowerCase());
    } else {
      accountsMissingInList += 1;
      await logger.submitEvent({
        host: SERVICE_NAME,
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
        await logger.submitEvent({
          host: SERVICE_NAME,
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
    await logger.submitEvent({
      host: SERVICE_NAME,
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
    await logger.submitEvent({
      host: SERVICE_NAME,
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

  await logger.submitMetrics({
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

async function checkTotalSupply(
  network: Network,
  accounts: AccountDefinition[]
) {
  const tokens = getNetworkModel(network)
    .getAllTokens()
    .filter(
      (t) =>
        !!t.currencyId &&
        t.tokenType !== 'Underlying' &&
        t.tokenType !== 'VaultCash' &&
        t.tokenType !== 'VaultDebt'
    );

  const maturedBalances = new Map<string, TokenBalance>();
  const totalBalances = accounts.reduce((m, a) => {
    a.balances.forEach((_b) => {
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
        const maturedValue = b.isNegative() ? b.toPrimeDebt() : b.toPrimeCash();

        maturedBalances.set(
          maturedValue.tokenId,
          (
            maturedBalances.get(maturedValue.tokenId) || maturedValue.copy(0)
          ).add(maturedValue.abs())
        );
      } else {
        m.set(
          tokenId,
          (m.get(tokenId) || new TokenBalance(0, tokenId, network)).add(
            new TokenBalance(b.n, tokenId, network).abs()
          )
        );
      }
    });

    return m;
  }, new Map<string, TokenBalance>());

  const settlementReserveBalances =
    accounts.find((a) => a.address === SETTLEMENT_RESERVE)?.balances || [];
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
      await logger.submitEvent({
        host: SERVICE_NAME,
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
      const computedSupply = totalBalances.get(id) || TokenBalance.zero(token);
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
        await logger.submitEvent({
          host: SERVICE_NAME,
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
      await logger.submitEvent({
        host: SERVICE_NAME,
        network,
        aggregation_key: 'TotalSupplyMissing',
        alert_type: 'warning',
        title: `Total Supply Missing: ${symbol}`,
        tags: [],
        text: `Total Supply missing for ${symbol}`,
      });
    }
  }

  const allVaults = getNetworkModel(network).getAllListedVaults() || [];
  for (const v of allVaults) {
    const totalUsedPrimaryBorrowCapacity = v.totalUsedPrimaryBorrowCapacity;
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
      totalComputedBorrows.sub(totalUsedPrimaryBorrowCapacity).abs().toFloat() >
      1e-4
    ) {
      // NOTE: this will throw an error if the vault is not settled
      await logger.submitEvent({
        host: SERVICE_NAME,
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
    const underlyingHeld = new TokenBalance(
      // Takes the most recent underlying snapshot
      e.underlyingSnapshots?.shift()?.storedBalanceOf || 0,
      e.underlying.id,
      network
    ).add(
      new TokenBalance(
        // Takes the most recent external lending snapshot
        e.externalSnapshots?.shift()?.storedBalanceOfUnderlying || 0,
        e.underlying.id,
        network
      )
    );

    const pCash = getNetworkModel(network).getPrimeCash(
      underlyingHeld.currencyId
    );
    const pDebt = getNetworkModel(network).getPrimeDebt(
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
      await logger.submitEvent({
        host: SERVICE_NAME,
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

  await logger.submitMetrics({ series });
}

async function monitorRelayerBalances(network: Network) {
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

  await logger.submitMetrics({ series });
}

async function checkSubgraphBlockNumber(network: Network) {
  const meta = (await Registry.getAnalyticsRegistry().getView(
    network,
    'SubgraphMeta'
  )) as unknown as MetaQuery;

  await logger.submitMetrics({
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
      (getNowSeconds() - (meta._meta?.block.timestamp || 0)) / SECONDS_IN_HOUR;

    await logger.submitEvent({
      host: SERVICE_NAME,
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

async function checkRiskServiceUpdates(network: Network) {
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
  await logger.submitMetrics({
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
    await logger.submitEvent({
      host: SERVICE_NAME,
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

async function saveTotalsData() {
  const kpi = Registry.getAnalyticsRegistry().getKPIs();
  await getS3().send(
    new PutObjectCommand({
      Bucket: 'view-cache-r2',
      Key: `all/kpi`,
      Body: JSON.stringify(kpi),
    })
  );

  await logger.submitMetrics({
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

async function checkVaultReinvestments(network: Network) {
  const reinvestments =
    Registry.getAnalyticsRegistry().getVaultReinvestments(network);
  const oneHourAgo = getNowSeconds() - SECONDS_IN_HOUR;

  for (const [vaultAddress, reinvestmentList] of Object.entries(
    reinvestments
  )) {
    for (const reinvestment of reinvestmentList) {
      if (reinvestment.timestamp < oneHourAgo) continue;
      const vault = getNetworkModel(network).getVaultConfig(vaultAddress);
      const rewardToken = getNetworkModel(network).getTokenByID(
        reinvestment.rewardTokenSold.id
      );
      const borrowCurrency = getNetworkModel(network).getTokenByID(
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
      const defiLlamaPrice = await fetchPriceFromDeFiLlama(
        network,
        rewardToken.id,
        borrowCurrency.id,
        reinvestment.timestamp
      );

      // Calculate the difference as a percentage
      const priceDifference =
        Math.abs((calculatedPrice - defiLlamaPrice) / defiLlamaPrice) * 100;

      // Log metrics
      await logger.submitMetrics({
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

async function fetchPriceFromDeFiLlama(
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
