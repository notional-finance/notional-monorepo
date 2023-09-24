import {
  Network,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import NotionalV3Liquidator from './NotionalV3Liquidator';
import * as tokens from './config/tokens.json';
import * as currencies from './config/currencies.json';
import * as overrides from './config/overrides.json';
import { ERC20__factory } from '@notional-finance/contracts';
import { MetricNames } from './types';
import { Logger } from '@notional-finance/durable-objects';

export interface Env {
  ACCOUNT_SERVICE_URL: string;
  DATA_SERVICE_AUTH_TOKEN: string;
  ZERO_EX_SWAP_URL: string;
  ZERO_EX_API_KEY: string;
  NETWORK: string;
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

  const provider = getProviderFromNetwork(Network[env.NETWORK], true);
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
      currencies: currencies.arbitrum.map((c) => {
        return {
          id: c.id,
          tokenType: c.type,
          hasTransferFee: c.hasTransferFee,
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

  const riskyAccounts = await liq.getRiskyAccounts(addrs);

  const ddSeries = {
    series: [],
  };

  ddSeries.series.push({
    name: MetricNames.NUM_RISKY_ACCOUNTS,
    value: riskyAccounts.length,
    tags: [`network:${env.NETWORK}`],
    timestamp: getNowSeconds(),
  });

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
