import {
  Network,
  ZERO_ADDRESS,
  batchArray,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber, ethers } from 'ethers';
import * as tokens from './config/tokens.json';
import VaultV3Liquidator from './VaultV3Liquidator';
import { IGasOracle, MetricNames } from './types';
import {
  DDSeries,
  Logger,
  MetricType,
} from '@notional-finance/durable-objects';

export interface Env {
  NX_DATA_URL: string;
  SUPPORTED_NETWORKS: Network[];
  ACCOUNT_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  NETWORK: Network;
  FLASH_LIQUIDATOR_CONTRACT: string;
  FLASH_LIQUIDATOR_OWNER: string;
  FLASH_LENDER_ADDRESS: string;
  FLASH_LOAN_BUFFER: string;
  NOTIONAL_PROXY_CONTRACT: string;
  DUST_THRESHOLD: string;
  ALCHEMY_KEY: string;
  BN_API_KEY: string;
  DD_API_KEY: string;
  DD_APP_KEY: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  SLIPPAGE_LIMIT: string;
  GAS_COST_BUFFER: string;
  PROFIT_THRESHOLD: string;
  ZERO_EX_SWAP_URL: string;
  ZERO_EX_API_KEY: string;
}

class ArbitrumGasOracle implements IGasOracle {
  public async getGasPrice(): Promise<BigNumber> {
    // 0.1 gwei
    return ethers.utils.parseUnits('1', 8);
  }
}

export const overrides = {
  [Network.arbitrum]: {
    [ZERO_ADDRESS]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  },
  [Network.Mainnet]: {
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
    .map(([v]) => v as string);

  const provider = getProviderFromNetwork(env.NETWORK, true);
  const liq = new VaultV3Liquidator(
    provider,
    {
      network: env.NETWORK,
      vaultAddrs: activeVaults,
      flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACT,
      flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
      flashLenderAddress: env.FLASH_LENDER_ADDRESS,
      flashLoanBuffer: BigNumber.from(env.FLASH_LOAN_BUFFER),
      slippageLimit: BigNumber.from(env.SLIPPAGE_LIMIT),
      notionalAddress: env.NOTIONAL_PROXY_CONTRACT,
      dustThreshold: BigNumber.from(env.DUST_THRESHOLD),
      txRelayUrl: env.TX_RELAY_URL,
      txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
      tokens: new Map<string, string>(Object.entries(tokens[env.NETWORK])),
      gasCostBuffer: BigNumber.from(env.GAS_COST_BUFFER),
      profitThreshold: BigNumber.from(env.PROFIT_THRESHOLD),
      zeroExUrl: env.ZERO_EX_SWAP_URL,
      zeroExApiKey: env.ZERO_EX_API_KEY,
      gasOracle: new ArbitrumGasOracle(),
    },
    logger
  );

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

  for (const riskyAccount of riskyAccounts) {
    try {
      const accountLiq = await liq.getAccountLiquidation(riskyAccount);

      if (accountLiq) {
        await liq.liquidateAccount(accountLiq);
      }
    } catch (e) {
      console.error(e);
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
