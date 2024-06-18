import {
  Network,
  ZERO_ADDRESS,
  batchArray,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import NotionalV3Liquidator from './NotionalV3Liquidator';
import { overrides } from './overrides';
import { ERC20__factory } from '@notional-finance/contracts';
import { MetricNames, RiskyAccount } from './types';
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
  ZERO_EX_API_KEY: string;
  NETWORK: Network;
  FLASH_LIQUIDATOR_CONTRACT: string;
  FLASH_LIQUIDATOR_OWNER: string;
  FLASH_LOAN_BUFFER: string;
  NOTIONAL_PROXY_CONTRACT: string;
  DUST_THRESHOLD: string;
  ALCHEMY_KEY: string;
  DD_API_KEY: string;
  DD_APP_KEY: string;
  TX_RELAY_URL: string;
  TX_RELAY_AUTH_TOKEN: string;
  EXACT_IN_SLIPPAGE_LIMIT: string;
  EXACT_OUT_SLIPPAGE_LIMIT: string;
  GAS_COST_BUFFER: string;
  PROFIT_THRESHOLD: string;
}

async function setUp(env: Env) {
  const allTokens = await (
    await fetch(`https://data-dev.notional.finance/${env.NETWORK}/tokens`)
  ).json();

  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'liquidator',
  });

  const provider = getProviderFromNetwork(env.NETWORK, true);
  const liquidator = new NotionalV3Liquidator(
    provider,
    {
      network: env.NETWORK,
      flashLiquidatorAddress: env.FLASH_LIQUIDATOR_CONTRACT,
      flashLiquidatorOwner: env.FLASH_LIQUIDATOR_OWNER,
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
      zeroExUrl: env.ZERO_EX_SWAP_URL,
      zeroExApiKey: env.ZERO_EX_API_KEY,
      exactInSlippageLimit: BigNumber.from(env.EXACT_IN_SLIPPAGE_LIMIT),
      exactOutSlippageLimit: BigNumber.from(env.EXACT_OUT_SLIPPAGE_LIMIT),
      gasCostBuffer: BigNumber.from(env.GAS_COST_BUFFER),
      profitThreshold: BigNumber.from(env.PROFIT_THRESHOLD),
    },
    logger
  );

  return { liquidator, logger };
}

async function processAllAccounts(env: Env, liquidator: NotionalV3Liquidator) {
  // Currently the worker cannot process more than 2000 accounts per batch
  const accounts = (await (
    await fetch(`${env.ACCOUNT_SERVICE_URL}?network=${env.NETWORK}`, {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    })
  ).json()) as { account_id: string }[];
  const addresses: string[] = accounts
    .map((a) => a.account_id)
    .filter((a) => a !== ZERO_ADDRESS);

  const batchedAccounts = batchArray(addresses, 250);
  let riskyAccounts: RiskyAccount[] = [];
  for (const batch of batchedAccounts) {
    const risky = await liquidator.getRiskyAccounts(batch);
    riskyAccounts = riskyAccounts.concat(risky);
  }

  return { riskyAccounts, addresses };
}

async function getAccountLiquidation(env: Env, address: string) {
  const { liquidator } = await setUp(env);
  const riskyAccounts = await liquidator.getRiskyAccounts([address]);
  if (riskyAccounts.length) {
    const liquidation = await liquidator.getLargestLiquidation(
      riskyAccounts[0]
    );

    return liquidation;
  } else {
    return await liquidator.getAccountData(address);
  }
}

const displayRiskyAccounts = async (env: Env) => {
  const { liquidator } = await setUp(env);
  const { riskyAccounts, addresses } = await processAllAccounts(
    env,
    liquidator
  );

  return {
    riskyAccounts: riskyAccounts
      .sort((a, b) => (a.ethFreeCollateral.lt(b.ethFreeCollateral) ? 1 : -1))
      .map((r) => ({
        account: r.id,
        freeCollateral: formatUnits(r.ethFreeCollateral, 18),
      })),
    totalAccountsProcessed: addresses.length,
  };
};

const run = async (env: Env) => {
  const { logger, liquidator } = await setUp(env);
  const { riskyAccounts, addresses } = await processAllAccounts(
    env,
    liquidator
  );

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
      tags: [`network:${env.NETWORK}`, 'version:v3.2'],
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
      tags: [`network:${env.NETWORK}`, 'version:v3.2'],
    }
  );

  await logger.submitMetrics(ddSeries);
  for (const account of riskyAccounts) {
    await logger.submitEvent({
      aggregation_key: 'RiskyAccount',
      alert_type: 'info',
      host: 'cloudflare',
      network: env.NETWORK,
      title: `Risky Account: ${account.id}`,
      tags: [`account:${account.id}`, `event:risky_account`],
      text: `
account: ${account.id}
freeCollateral: ${formatUnits(account.ethFreeCollateral, 18)}
net underlying available:
${Array.from(account.netUnderlyingAvailable.entries())
  .map(([id, amt]) => `${id}: ${formatUnits(amt, 8)}`)
  .join('\n')}
`,
    });
  }

  for (const riskyAccount of riskyAccounts) {
    const liquidation = await liquidator.getLargestLiquidation(riskyAccount);
    await liquidator.liquidateAccount(liquidation);
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
      if (url.pathname === '/') {
        return new Response(JSON.stringify(await displayRiskyAccounts(env)), {
          status: 200,
        });
      } else if (splitPath.length === 2) {
        return new Response(
          JSON.stringify(
            await getAccountLiquidation(env, splitPath[1].toLowerCase())
          ),
          { status: 200 }
        );
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (e) {
      console.error(e);
      console.trace();
      return new Response(e, { status: 500 });
    }
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
