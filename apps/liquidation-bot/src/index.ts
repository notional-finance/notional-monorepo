import {
  Network,
  getNowSeconds,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import {
  DDSeries,
  initEventLogger,
  initMetricLogger,
  submitMetrics,
} from '@notional-finance/logging';
import NotionalV3Liquidator from './NotionalV3Liquidator';
import * as tokens from './config/tokens.json';
import * as currencies from './config/currencies.json';
import * as overrides from './config/overrides.json';
import { ERC20__factory } from '@notional-finance/contracts';
import { MetricNames } from './types';

export interface Env {
  ACCOUNT_CACHE: DurableObjectNamespace;
  ZERO_EX_SWAP_URL: string;
  ZERO_EX_API_KEY: string;
  NETWORK: string;
  FLASH_LIQUIDATOR_CONTRACT: string;
  FLASH_LIQUIDATOR_OWNER: string;
  FLASH_LENDER_ADDRESS: string;
  FLASH_LOAN_BUFFER: string;
  NOTIONAL_PROXY_CONTRACT: string;
  DUST_THRESHOLD: string;
  LIQUIDATORS: string;
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
  initMetricLogger({
    apiKey: env.DD_API_KEY,
  });
  initEventLogger({
    apiKey: env.DD_API_KEY,
  });

  const id = env.ACCOUNT_CACHE.idFromName('ACCOUNT_CACHE');
  const stub = env.ACCOUNT_CACHE.get(id);
  const resp = await stub.fetch('');
  const data = (await resp.json()) as any;
  const addrs = data['default'].map((a) => a.id);

  const provider = getProviderFromNetwork(Network[env.NETWORK], true);
  const liq = new NotionalV3Liquidator(provider, {
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
        assetName: c.name,
        assetSymbol: c.symbol,
        assetDecimals: BigNumber.from(10).pow(c.decimals),
        assetDecimalPlaces: c.decimals,
        assetContract: ERC20__factory.connect(c.address, provider),
        tokenType: c.type,
        hasTransferFee: c.hasTransferFee,
        underlyingName: c.name,
        underlyingSymbol: c.symbol,
        underlyingDecimals: BigNumber.from(10).pow(c.decimals),
        underlyingDecimalPlaces: c.decimals,
        underlyingContract: ERC20__factory.connect(c.address, provider),
        nTokenSymbol: c.nTokenSymbol,
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
  });

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

  for (let i = 0; i < riskyAccounts.length; i++) {
    const riskyAccount = riskyAccounts[i];

    const possibleLiqs = await liq.getPossibleLiquidations(riskyAccount);

    if (possibleLiqs.length > 0) {
      await liq.liquidateAccount(possibleLiqs[0]);
    }
  }

  await submitMetrics(ddSeries);
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
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
    ctx: ExecutionContext
  ): Promise<void> {
    try {
      await run(env);
    } catch (e) {
      console.error(e);
      console.trace();
    }
  },
};
