import { BigNumber, ethers, FixedNumber } from 'ethers';
import { IAggregatorABI } from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { log } from '@notional-finance/logging';
import { getProvider } from './providers';
import { JobOptions, VolatilityType } from './types';
import {
  AggregateCallList,
  MonitorJob,
  OracleContractConfig,
  VolatilityType,
} from './types';

let provider: ethers.providers.JsonRpcBatchProvider;

const configMap: Map<string, OracleContractConfig> = new Map([
  [
    'eth_usd',
    {
      key: 'eth_usd',
      address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
      decimals: 8,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
  [
    'btc_usd',
    {
      key: 'btc_usd',
      address: '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
      decimals: 8,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
  [
    'dai_usd',
    {
      key: 'dai_usd',
      address: '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
      decimals: 8,
      volatilityType: VolatilityType.STABLE,
    },
  ],
  [
    'usdc_usd',
    {
      key: 'usdc_usd',
      address: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      decimals: 8,
      volatilityType: VolatilityType.STABLE,
    },
  ],
  [
    'wbtc_btc',
    {
      key: 'wbtc_btc',
      address: '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23',
      decimals: 8,
      volatilityType: VolatilityType.STABLE,
    },
  ],
  [
    'comp_eth',
    {
      key: 'comp_eth',
      address: '0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699',
      decimals: 18,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
  [
    'steth_usd',
    {
      key: 'steth_usd',
      address: '0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8',
      decimals: 8,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
  [
    'wsteth_usd',
    {
      key: 'wsteth_usd',
      address: '0x8770d8dEb4Bc923bf929cd260280B5F1dd69564D',
      decimals: 18,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
  [
    'bal_usd',
    {
      key: 'bal_usd',
      address: '0xdF2917806E30300537aEB49A7663062F4d1F2b5F',
      decimals: 8,
      volatilityType: VolatilityType.VOLATILE,
    },
  ],
]);

function getCalls(): AggregateCallList {
  const calls = [...configMap.values()].map(({ key, address }) => {
    const contract = new ethers.Contract(address, IAggregatorABI, provider);
    return {
      target: contract,
      method: 'latestAnswer',
      args: [],
      key,
    };
  });

  return { provider, calls };
}

async function aggregateCalls() {
  const { provider, calls } = getCalls();
  const { name } = await provider.getNetwork();
  const { blockNumber, results } = await aggregate(calls, provider);
  const exchangeRates = Object.keys(results).map((key) => {
    const quote = key.split('_')[0];
    const base = key.split('_')[1];
    const metadata = {
      source: 'chainlink',
      address: configMap.get(key)!.address,
      volatilityType: configMap.get(key)!.volatilityType,
      blockNumber,
      key,
    };
    const value = results[key];
    const decimals = configMap.get(key)!.decimals;
    return {
      quote,
      base,
      value,
      decimals,
      metadata,
    };
  });
  return { network: name, blockNumber, results: exchangeRates };
}

async function run({ env }: JobOptions): Promise<void> {
  try {
    const id = env.EXCHANGE_RATE_STORE.idFromName(
      env.EXCHANGE_RATES_WORKER_NAME
    );
    const stub = env.EXCHANGE_RATE_STORE.get(id);

    provider = getProvider('mainnet');
    const { network, blockNumber, results } = await aggregateCalls();
    const req = new Request(`${env.EXCHANGE_RATE_URL}/exchange-rates`, {
      method: 'PUT',
      body: JSON.stringify({ rates: { network, blockNumber, results } }),
    });
    await stub.fetch(req);

    await Promise.all(
      results.map(async (quote) => {
        const volatilityType = quote.metadata.volatilityType;
        const exchangeRate = FixedNumber.fromValue(
          quote.value,
          quote.decimals
        ).toUnsafeFloat();
        await log({
          level: 'info',
          message: `exchange rate for ${quote.metadata.key}`,
          chain: network,
          metadata: quote.metadata,
          currency: quote.metadata.key,
          blockNumber,
          exchangeRate,
          volatilityType,
        });
      })
    );
  } catch (e) {
    console.log(e);
    await log({
      message: (e as Error).message,
      level: 'error',
      chain: 'homestead',
      action: 'exchange_rate.refresh',
    });
  }
}

export const exchangeRateMonitorMainnet: MonitorJob = {
  run,
};
