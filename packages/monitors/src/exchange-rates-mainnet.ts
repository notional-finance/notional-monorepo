import { ethers, FixedNumber } from 'ethers';
import { IAggregatorABI } from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { log } from '@notional-finance/logging';
import { getProvider } from './providers';
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
  const calls = [...configMap.values()].map(({ key, address, decimals }) => {
    const contract = new ethers.Contract(address, IAggregatorABI, provider);
    return {
      target: contract,
      method: 'latestAnswer',
      args: [],
      key,
      transform: (r: Awaited<ReturnType<typeof contract.latestAnswer>>) => {
        return FixedNumber.fromValue(r, decimals).toUnsafeFloat();
      },
    };
  });

  return { provider, calls };
}

async function aggregateCalls() {
  const { provider, calls } = getCalls();
  const { name } = await provider.getNetwork();
  const { blockNumber, results } = await aggregate(calls, provider);
  return { network: name, blockNumber, results };
}

async function run(): Promise<void> {
  try {
    provider = getProvider('mainnet');
    const { network, blockNumber, results } = await aggregateCalls();

    await Promise.all(
      Object.keys(results).map(async (currency) => {
        await log({
          level: 'info',
          message: `exchange rate for ${currency}`,
          chain: network,
          currency,
          blockNumber,
          exchangeRate: results[currency],
          volatilityType: configMap.has(currency)
            ? configMap.get(currency).volatilityType
            : VolatilityType.VOLATILE,
        });
      })
    );
  } catch (e) {
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
