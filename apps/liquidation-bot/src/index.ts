import {
  DATA_SERVICE_URL,
  DataServiceEndpoints,
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
import { formatUnits, isAddress } from 'ethers/lib/utils';
import { CacheSchema, TokenDefinition } from '@notional-finance/core-entities';
import { DDSeries, Logger, MetricType } from '@notional-finance/util';

export interface Env {
  NX_REGISTRY_URL: string;
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
  TX_RELAY_AUTH_TOKEN: string;
  EXACT_IN_SLIPPAGE_LIMIT: string;
  EXACT_OUT_SLIPPAGE_LIMIT: string;
  GAS_COST_BUFFER: string;
  PROFIT_THRESHOLD: string;
  ENVIRONMENT: string;
  AUTH_KEY: string;
  ACCOUNTS_KV: KVNamespace;
}

async function setUp(env: Env) {
  const allTokens: CacheSchema<TokenDefinition> = await (
    await fetch(`${env.NX_REGISTRY_URL}/${env.NETWORK}/tokens`)
  ).json();

  const logger = new Logger({
    apiKey: env.DD_API_KEY,
    version: '1',
    env: env.NETWORK,
    service: 'liquidator',
    environment: env.ENVIRONMENT,
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
      txRelayAuthToken: env.TX_RELAY_AUTH_TOKEN,
      currencies: allTokens['values']
        .filter(
          ([, t]) =>
            t && t.tokenType === 'Underlying' && t.currencyId !== undefined
        )
        .map(([, c]) => {
          if (
            c === null ||
            c.address === undefined ||
            c.currencyId === undefined
          )
            throw Error();

          return {
            id: c.currencyId,
            tokenType: c.tokenType,
            hasTransferFee: false,
            underlyingName: c.name,
            underlyingSymbol: c.symbol,
            underlyingDecimals: BigNumber.from(10).pow(c.decimals),
            underlyingDecimalPlaces: c.decimals,
            underlyingContract: ERC20__factory.connect(c.address, provider),
          };
        }),
      overrides: overrides[env.NETWORK],
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

async function getAccounts(env: Env) {
  const accounts = await env.ACCOUNTS_KV.get(env.NETWORK);
  if (accounts) {
    return JSON.parse(accounts) as string[];
  }
  return fetch(
    `${DATA_SERVICE_URL}/${DataServiceEndpoints.ACCOUNTS}?network=${env.NETWORK}`,
    {
      headers: {
        'x-auth-token': env.DATA_SERVICE_AUTH_TOKEN,
      },
    }
  )
    .then((r) => r.json() as Promise<{ account_id: string }[]>)
    .then((r) => r.map((a) => a.account_id))
    .then((r) => r.filter((a) => a !== ZERO_ADDRESS));
}

async function processAllAccounts(
  env: Env,
  liquidator: NotionalV3Liquidator,
  skip: number
) {
  const accounts = await getAccounts(env);
  // process maximum 1000 accounts
  const addresses = accounts.slice(skip, skip + 1000);
  console.log(
    `Processing ${addresses.length} accounts, from: ${
      addresses[0]
    } to ${addresses.at(-1)}`
  );

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
    if (liquidation) await liquidator.liquidateAccount(liquidation);

    // Rewrite the liquidation object into something more readable
    if (liquidation)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      liquidation.accountLiq.liquidation =
        liquidation.accountLiq.liquidation.toString();

    return liquidation;
  } else {
    return await liquidator.getAccountData(address);
  }
}

const displayRiskyAccounts = async (env: Env) => {
  const { liquidator } = await setUp(env);
  const { riskyAccounts, addresses } = await processAllAccounts(
    env,
    liquidator,
    0
  );

  return {
    riskyAccounts: riskyAccounts
      .sort((a, b) => (a.ethFreeCollateral.lt(b.ethFreeCollateral) ? 1 : -1))
      .map((r) => ({
        account: r.id,
        freeCollateral: formatUnits(r.ethFreeCollateral, 8),
      })),
    totalAccountsProcessed: addresses.length,
  };
};

const run = async (env: Env, skip: number) => {
  const { logger, liquidator } = await setUp(env);
  const { riskyAccounts, addresses } = await processAllAccounts(
    env,
    liquidator,
    skip
  );

  const ddSeries: DDSeries = {
    series: [
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
      },
    ],
  };
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
freeCollateral: ${formatUnits(account.ethFreeCollateral, 8)}
net underlying available:
${Array.from(account.netUnderlyingAvailable.entries())
  .map(([id, amt]) => `${id}: ${formatUnits(amt, 8)}`)
  .join('\n')}
`,
    });
  }

  for (const riskyAccount of riskyAccounts) {
    const liquidation = await liquidator.getLargestLiquidation(riskyAccount);
    if (liquidation) await liquidator.liquidateAccount(liquidation);
  }
};

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    const authKey = request.headers.get('x-auth-key');
    if (authKey !== env.AUTH_KEY) {
      return new Response(null, { status: 401 });
    }
    try {
      const url = new URL(request.url);
      const splitPath = url.pathname.split('/');
      if (url.pathname === '/') {
        return new Response(JSON.stringify(await displayRiskyAccounts(env)), {
          status: 200,
        });
      } else if (
        splitPath.length === 2 &&
        isAddress(splitPath[1].toLowerCase())
      ) {
        return new Response(
          JSON.stringify(
            await getAccountLiquidation(env, splitPath[1].toLowerCase())
          ),
          { status: 200 }
        );
      } else if (url.pathname.startsWith('/trigger')) {
        const { searchParams } = new URL(request.url);
        const skip = Number(searchParams.get('skip')) || 0;
        await run(env, skip);

        return new Response('OK', { status: 200 });
      } else {
        return new Response('Not Found', { status: 404 });
      }
    } catch (e) {
      console.error(e);
      console.trace();
      return new Response(JSON.stringify(e), { status: 500 });
    }
  },
};
