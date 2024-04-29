import {
  Network,
  ZERO_ADDRESS,
  batchArray,
  getNowSeconds,
  getProviderFromNetwork,
  groupArrayToMap,
} from '@notional-finance/util';
import { BigNumber, PopulatedTransaction } from 'ethers';
import VaultV3Liquidator, { LiquidationType } from './VaultV3Liquidator';
import { MetricNames } from './types';
import {
  DDSeries,
  Logger,
  MetricType,
} from '@notional-finance/durable-objects';

export interface Env {
  NX_DATA_URL: string;
  ACCOUNT_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  NETWORK: Network;
  FLASH_LIQUIDATOR_CONTRACT: string;
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
}

export const overrides = {
  [Network.arbitrum]: {
    [ZERO_ADDRESS]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [Network.mainnet]: {
    [ZERO_ADDRESS]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
};

const run = async (env: Env) => {
  const allVaults = await (
    await fetch(`https://data-dev.notional.finance/${env.NETWORK}/vaults`)
  ).json();

  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'vault-liquidator',
  });

  const accounts = (
    (await (
      await fetch(`${env.ACCOUNT_SERVICE_URL}?network=${env.NETWORK}`, {
        headers: {
          'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
        },
      })
    ).json()) as { account_id: string; vault_id: string }[]
  ).filter(({ account_id }) => account_id !== ZERO_ADDRESS);

  const activeVaults: string[] = allVaults['values']
    .filter(([, v]) => v['enabled'] === true)
    .map(([v]) => v as string)
    // TODO: Temporarily filter out the rETH vault
    .filter((v) => v !== '0xa0d61c08e642103158fc6a1495e7ff82baf25857');

  const provider = getProviderFromNetwork(env.NETWORK, true);
  const liq = new VaultV3Liquidator(provider, {
    network: env.NETWORK,
    vaultAddrs: activeVaults,
    flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACT,
    flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
    flashLenderAddress: env.FLASH_LENDER_ADDRESS,
    flashLoanBuffer: BigNumber.from(env.FLASH_LOAN_BUFFER),
    slippageLimit: BigNumber.from(env.SLIPPAGE_LIMIT),
    notionalAddress: env.NOTIONAL_PROXY_CONTRACT,
    txRelayUrl: env.TX_RELAY_URL,
    txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
  });

  const batchedAccounts = batchArray(
    accounts.filter(({ vault_id }) => activeVaults.includes(vault_id)),
    250
  );

  const riskyAccounts =
    // Batch up the accounts so that we don't get errors from the RPC
    (
      await Promise.all(batchedAccounts.map((a) => liq.getRiskyAccounts(a)))
    ).flatMap((_) => _);

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

  const groupedByVault = groupArrayToMap(riskyAccounts, (t) => t.vault);
  for (const vault of groupedByVault.keys()) {
    const vaultRiskyAccounts = groupedByVault.get(vault) || [];

    const { config, borrowToken } = await liq.getVaultConfig(vault);
    const currencyId = config.borrowCurrencyId;
    const currencyIndex = 0;
    const assetAddress =
      overrides[liq.settings.network][borrowToken.tokenAddress] ||
      borrowToken.tokenAddress;
    const assetPrecision = borrowToken.decimals;

    const groupedByMaturity = groupArrayToMap(
      vaultRiskyAccounts,
      (t) => t.maturity
    );

    const batches: PopulatedTransaction[] = [];
    const batchAccounts: string[] = [];
    for (const maturity of groupedByMaturity.keys()) {
      const accts = groupedByMaturity.get(maturity) || [];

      if (accts.length > 0) {
        const { flashLoanAmount, redeemData } = await liq.getBatchParams(
          vault,
          maturity,
          accts,
          assetPrecision
        );

        const accounts = accts.map((a) => a.id);
        const batchCalldata =
          await liq.liquidatorContract.populateTransaction.flashLiquidate(
            assetAddress,
            flashLoanAmount,
            {
              liquidationType: LiquidationType.DELEVERAGE_VAULT_ACCOUNT,
              currencyId,
              currencyIndex,
              accounts,
              vault,
              redeemData,
            }
          );
        batches.push(batchCalldata);
        batchAccounts.push(...accounts);
      }
    }

    const resp = await liq.liquidateViaMulticall(batches);
    if (resp.status === 200) {
      const respInfo = await resp.json();
      await logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'info',
        host: 'cloudflare',
        network: liq.settings.network,
        title: `Vault Accounts Liquidated`,
        tags: [`event:vault_account_liquidated`].concat(
          batchAccounts.map((a) => `account:${a}`)
        ),
        text: `Liquidated vault accounts in batch ${batchAccounts.join(',')}, ${
          respInfo['hash']
        }`,
      });
    } else {
      console.log(
        'Failed liquidation',
        resp.status,
        resp.statusText,
        await resp.json()
      );
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
      await run(env);
    } catch (e) {
      console.error(e);
      console.trace();
    }

    const response = new Response('OK', { status: 200 });
    return response;
  },
  async scheduled(
    controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    try {
      await run(env);
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
};
