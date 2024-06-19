import {
  Network,
  ZERO_ADDRESS,
  batchArray,
  getNowSeconds,
  getProviderFromNetwork,
  groupArrayToMap,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import VaultV3Liquidator from './VaultV3Liquidator';
import { MetricNames } from './types';
import {
  DDSeries,
  Logger,
  MetricType,
} from '@notional-finance/durable-objects';
import { formatUnits } from 'ethers/lib/utils';

export interface Env {
  NX_DATA_URL: string;
  ACCOUNT_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  NETWORK: Network;
  FLASH_LIQUIDATOR_CONTRACTS: string[];
  FLASH_LIQUIDATOR_OWNER: string;
  FLASH_LENDER_ADDRESS: string;
  FLASH_LOAN_BUFFER: string;
  NOTIONAL_PROXY_CONTRACT: string;
  ALCHEMY_KEY: string;
  DD_API_KEY: string;
  DD_APP_KEY: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  SLIPPAGE_LIMIT: string;
  MAX_LIQUIDATIONS_PER_BATCH: number;
}

export const overrides = {
  [Network.arbitrum]: {
    [ZERO_ADDRESS]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [Network.mainnet]: {
    [ZERO_ADDRESS]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
};

async function setUp(env: Env, vaultAddrs: string[]) {
  const accounts = (
    (await (
      await fetch(`${env.ACCOUNT_SERVICE_URL}?network=${env.NETWORK}`, {
        headers: {
          'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
        },
      })
    ).json()) as { account_id: string; vault_id: string }[]
  ).filter(
    ({ account_id, vault_id }) =>
      account_id !== ZERO_ADDRESS && vaultAddrs.includes(vault_id)
  );

  const provider = getProviderFromNetwork(env.NETWORK, true);
  const liquidator = new VaultV3Liquidator(provider, {
    network: env.NETWORK,
    vaultAddrs,
    flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACTS,
    flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
    flashLoanBuffer: BigNumber.from(env.FLASH_LOAN_BUFFER),
    slippageLimit: BigNumber.from(env.SLIPPAGE_LIMIT),
    notionalAddress: env.NOTIONAL_PROXY_CONTRACT,
    txRelayUrl: env.TX_RELAY_URL,
    txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
    maxLiquidationsPerBatch: env.MAX_LIQUIDATIONS_PER_BATCH,
  });
  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'vault-liquidator',
  });

  const batchedAccounts = batchArray(accounts, 250);

  const accountData =
    // Batch up the accounts so that we don't get errors from the RPC
    (
      await Promise.all(
        batchedAccounts.map((a) => liquidator.getRiskyAccounts(a, logger))
      )
    )
      .flatMap((_) => _)
      .sort((a, b) => (a.collateralRatio.lt(b.collateralRatio) ? -1 : 1));

  return { accounts: accountData, liquidator };
}

const runSingleVault = async (vault: string, env: Env) => {
  const { accounts, liquidator } = await setUp(env, [vault]);
  const riskyAccounts = accounts.filter((a) => a.canLiquidate);

  const { batches } = await liquidator.batchMaturityLiquidations(
    vault,
    riskyAccounts
  );
  const serializedAccounts = accounts
    .filter((a) => a.vaultShares.gt(BigNumber.from(0)))
    .map((a) => ({
      account: a.id,
      collateralRatio: a.collateralRatio.lt(
        BigNumber.from(Number.MAX_SAFE_INTEGER.toString())
      )
        ? a.collateralRatio.toNumber() / 1e9
        : null,
      maxLiquidatorDepositUnderlying:
        a.maxLiquidatorDepositUnderlying[0].toString(),
      vaultSharesToLiquidator: a.vaultSharesToLiquidator[0].toString(),
      debtUnderlying: formatUnits(a.debtUnderlying, 8),
      vaultShares: formatUnits(a.vaultShares, 8),
      vaultCash: formatUnits(a.cashBalance, 8),
      maturity: a.maturity,
      canLiquidate: a.canLiquidate,
    }));
  const serializedBatchArgs = batches.map(({ args: a }) => ({
    asset: a.asset,
    amount: a.amount.toString(),
    params: {
      ...a.params,
    },
  }));

  return new Response(
    JSON.stringify({
      accounts: serializedAccounts,
      riskyAccounts: serializedAccounts.filter((a) => a.canLiquidate),
      batches,
      batchArgs: serializedBatchArgs,
    })
  );
};

const runAllVaults = async (env: Env) => {
  const allVaults = await (
    await fetch(`https://data-dev.notional.finance/${env.NETWORK}/vaults`)
  ).json();

  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'vault-liquidator',
  });

  const activeVaults: string[] = allVaults['values']
    .filter(([, v]) => v['enabled'] === true)
    .map(([v]) => v as string);

  const { accounts, liquidator } = await setUp(env, activeVaults);
  const riskyAccounts = accounts.filter((r) => r.canLiquidate);

  const ddSeries: DDSeries = {
    series: [],
  };

  ddSeries.series.push(
    {
      metric: MetricNames.NUM_RISKY_ACCOUNTS,
      points: [
        {
          value: riskyAccounts.length,
          timestamp: getNowSeconds(),
        },
      ],
      type: MetricType.Gauge,
      tags: [`network:${env.NETWORK}`],
    },
    {
      metric: MetricNames.TOTAL_ACCOUNTS_PROCESSED,
      points: [
        {
          value: accounts.length,
          timestamp: getNowSeconds(),
        },
      ],
      type: MetricType.Gauge,
      tags: [`network:${env.NETWORK}`],
    }
  );

  await logger.submitMetrics(ddSeries);
  for (const r of riskyAccounts) {
    await logger.submitEvent({
      aggregation_key: 'RiskyAccount',
      alert_type: 'info',
      host: 'cloudflare',
      network: env.NETWORK,
      title: `Risky Vault Account: ${r.id} in Vault: ${r.vault}`,
      tags: [`event:risky_vault_account_detected`, `account:${r.id}`],
      text: `
  account:${r.id}
  collateralRatio: ${r.collateralRatio.toNumber() / 1e9}
  maxLiquidatorDepositUnderlying: ${r.maxLiquidatorDepositUnderlying[0].toString()}
  vaultSharesToLiquidator: ${r.vaultSharesToLiquidator[0].toString()}
  debtUnderlying: ${r.debtUnderlying.toNumber() / 1e8}
  vaultShares: ${r.vaultShares.toNumber() / 1e8}
  maturity: ${r.maturity}
  `,
    });
  }

  const groupedByVault = groupArrayToMap(riskyAccounts, (t) => t.vault);
  for (const vault of groupedByVault.keys()) {
    const vaultRiskyAccounts = groupedByVault.get(vault) || [];

    const { batches, batchAccounts } =
      await liquidator.batchMaturityLiquidations(vault, vaultRiskyAccounts);

    try {
      const { resp, batch, failingTxns } =
        await liquidator.liquidateViaMulticall(batches);

      if (failingTxns.length > 0) {
        await logger.submitEvent({
          aggregation_key: 'AccountLiquidated',
          alert_type: 'error',
          host: 'cloudflare',
          network: env.NETWORK,
          title: `Failed Vault Liquidation`,
          tags: [`event:failed_vault_liquidation`],
          text: `Failed to liquidate vault accounts in batch ${failingTxns
            .flatMap(({ args }) => args.params.accounts)
            .join(',')}`,
        });
      }
      await logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'info',
        host: 'cloudflare',
        network: env.NETWORK,
        title: `Vault Accounts Liquidated`,
        tags: [`event:vault_account_liquidated`].concat(
          batchAccounts.map((a) => `account:${a}`)
        ),
        text: `Liquidated vault accounts in batch ${batch
          .flatMap(({ args }) => args.params.accounts)
          .join(',')}, ${resp.hash}`,
      });
    } catch (e) {
      console.log('Failed liquidation', e.toString());
      await logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'error',
        host: 'cloudflare',
        network: env.NETWORK,
        title: `Failed Vault Liquidation`,
        tags: [`event:failed_vault_liquidation`],
        text: `Failed to liquidate vault accounts in batch ${batchAccounts.join(
          ','
        )}
        
        Error: ${e.toString()}
        `,
      });
    }
  }
};

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url);
      const splitPath = url.pathname.split('/');
      if (splitPath.length === 1) {
        await runAllVaults(env);
        return new Response('OK', { status: 200 });
      } else if (splitPath.length === 2) {
        return runSingleVault(splitPath[1].toLowerCase(), env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (e) {
      console.error(e);
      console.trace();
      throw e;
    }
  },
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    try {
      await runAllVaults(env);
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
};
