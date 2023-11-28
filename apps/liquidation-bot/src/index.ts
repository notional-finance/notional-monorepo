import {
  Network,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import NotionalV3Liquidator from './NotionalV3Liquidator';
import * as tokens from './config/tokens.json';
import { overrides } from './config/overrides';
import { ERC20__factory } from '@notional-finance/contracts';
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
  ZERO_EX_SWAP_URL: string;
  ZERO_EX_API_KEY: string;
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
  EXACT_IN_SLIPPAGE_LIMIT: string;
  EXACT_OUT_SLIPPAGE_LIMIT: string;
  GAS_COST_BUFFER: string;
  PROFIT_THRESHOLD: string;
}

const run = async (env: Env) => {
  const allTokens = await (
    await fetch(`https://data-dev.notional.finance/${env.NETWORK}/tokens`)
  ).json();

  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'liquidator',
  });

  const accounts = (await (
    await fetch(env.ACCOUNT_SERVICE_URL, {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    })
  ).json()) as any;
  const addrs = accounts.map((a) => a.account_id);

  const provider = getProviderFromNetwork(env.NETWORK, true);
  const liq = new NotionalV3Liquidator(
    provider,
    {
      network: env.NETWORK,
      flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACT,
      flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
      flashLenderAddress: env.FLASH_LENDER_ADDRESS,
      flashLoanBuffer: BigNumber.from(env.FLASH_LOAN_BUFFER),
      notionalAddress: env.NOTIONAL_PROXY_CONTRACT,
      dustThreshold: BigNumber.from(env.DUST_THRESHOLD),
      txRelayUrl: env.TX_RELAY_URL,
      txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
      currencies: allTokens['values']
        .filter(([, t]) => t['tokenType'] === 'Underlying')
        .map(([, c]) => {
          return {
            id: c.currencyId,
            tokenType: '',
            hasTransferFee: false,
            underlyingName: c.name,
            underlyingSymbol: c.symbol,
            underlyingDecimals: BigNumber.from(10).pow(c.decimals),
            underlyingDecimalPlaces: c.decimals,
            underlyingContract: ERC20__factory.connect(c.address, provider),
          };
        }),
      overrides: overrides.arbitrum,
      tokens: new Map<string, string>(Object.entries(tokens.arbitrum)),
      zeroExUrl: env.ZERO_EX_SWAP_URL,
      zeroExApiKey: env.ZERO_EX_API_KEY,
      exactInSlippageLimit: BigNumber.from(env.EXACT_IN_SLIPPAGE_LIMIT),
      exactOutSlippageLimit: BigNumber.from(env.EXACT_OUT_SLIPPAGE_LIMIT),
      gasCostBuffer: BigNumber.from(env.GAS_COST_BUFFER),
      profitThreshold: BigNumber.from(env.PROFIT_THRESHOLD),
    },
    logger
  );

  const chunkSize = 750;
  const batchedAccounts = Array.from(
    { length: Math.ceil(addrs.length / chunkSize) },
    (_, index) => addrs.slice(index * chunkSize, index * chunkSize + chunkSize)
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

  if (riskyAccounts.length > 0) {
    const riskyAccount = riskyAccounts[0];

    const possibleLiqs = await liq.getPossibleLiquidations(riskyAccount);

    if (possibleLiqs.length > 0) {
      await liq.liquidateAccount(possibleLiqs[0]);
    }
  }

  await logger.submitMetrics(ddSeries);
};

export default {
  async fetch(__: Request, env: Env, _: ExecutionContext): Promise<Response> {
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
    __: ScheduledController,
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
