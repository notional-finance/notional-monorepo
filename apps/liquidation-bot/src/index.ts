import {
  Network,
  ZERO_ADDRESS,
  batchArray,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import NotionalV3Liquidator from './NotionalV3Liquidator';
import * as tokens from './config/tokens.json';
import { overrides } from './config/overrides';
import { ERC20__factory } from '@notional-finance/contracts';
import { MetricNames, RiskyAccount } from './types';
import {
  DDSeries,
  Logger,
  MetricType,
} from '@notional-finance/durable-objects';

export interface Env {
  NX_DATA_URL: string;
  ACCOUNT_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
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

function shuffleArray(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const run = async (env: Env, isHourly: boolean) => {
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
    await fetch(`${env.ACCOUNT_SERVICE_URL}?network=${env.NETWORK}`, {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    })
  ).json()) as { account_id: string }[];
  let addresses: string[] = accounts
    .map((a) => a.account_id)
    .filter((a) => a !== ZERO_ADDRESS);

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
      overrides: overrides[env.NETWORK],
      tokens: new Map<string, string>(Object.entries(tokens[env.NETWORK])),
      zeroExApiKey: env.ZERO_EX_API_KEY,
      exactInSlippageLimit: BigNumber.from(env.EXACT_IN_SLIPPAGE_LIMIT),
      exactOutSlippageLimit: BigNumber.from(env.EXACT_OUT_SLIPPAGE_LIMIT),
      gasCostBuffer: BigNumber.from(env.GAS_COST_BUFFER),
      profitThreshold: BigNumber.from(env.PROFIT_THRESHOLD),
    },
    logger
  );

  // Currently the worker cannot process more than 2000 accounts per batch
  if (!isHourly && env.NETWORK === Network.arbitrum) {
    // Unable to scan all accounts in a single segment
    addresses = shuffleArray(addresses).slice(0, 5000);
  }

  console.log('Num Addresses', addresses.length);
  const batchedAccounts = batchArray(addresses, 250);
  let riskyAccounts: RiskyAccount[] = [];
  for (const batch of batchedAccounts) {
    const risky = await liq.getRiskyAccounts(batch);
    riskyAccounts = riskyAccounts.concat(risky);
  }

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
      tags: [`network:${env.NETWORK}`, 'version:v3'],
    },
    {
      metric: MetricNames.TOTAL_ACCOUNTS_PROCESSED,
      points: [
        {
          value: addresses.length,
          timestamp: getNowSeconds(),
        },
      ],
      type: MetricType.Gauge,
      tags: [`network:${env.NETWORK}`, 'version:v3'],
    }
  );

  await logger.submitMetrics(ddSeries);

  if (riskyAccounts.length > 0) {
    for (const account of riskyAccounts) {
      await logger.submitEvent({
        aggregation_key: 'RiskyAccount',
        alert_type: 'info',
        host: 'cloudflare',
        network: env.NETWORK,
        title: `Risky Account: ${account.id}`,
        tags: [`account:${account.id}`, `event:risky_account`],
        text: `Risky account ${account.id}`,
      });
    }
    const riskyAccount = riskyAccounts[0];

    const possibleLiqs = await liq.getPossibleLiquidations(riskyAccount);
    if (possibleLiqs.length === 0) {
      await logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'error',
        host: 'cloudflare',
        network: liq.settings.network,
        title: `Account liquidated`,
        tags: [`account:${riskyAccount.id}`, `event:failed_account_liquidated`],
        text: `
Failed to find possible liquidation for account: ${riskyAccount.id}
        `,
      });
    }

    if (possibleLiqs.length > 0) {
      await liq.liquidateAccount(possibleLiqs[0]);
    }
  }
};

export default {
  async fetch(__: Request, env: Env, _: ExecutionContext): Promise<Response> {
    try {
      await run(env, true);
    } catch (e) {
      console.error(e);
      console.trace();
    }

    const response = new Response('OK', { status: 200 });
    return response;
  },
  async scheduled(
    s: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    try {
      const isHourly = s.cron === '0 * * * *';
      await run(env, isHourly);
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
};
