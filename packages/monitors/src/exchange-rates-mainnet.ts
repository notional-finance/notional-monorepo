import { ethers, FixedNumber, providers } from 'ethers';
import { IAggregatorABI } from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { log } from '@notional-finance/logging';
import {
  AggregateCallList,
  JobOptions,
  MonitorJob,
  OracleContract,
} from './types';

let provider: ethers.providers.JsonRpcBatchProvider;

function getCalls(): AggregateCallList {
  const contracts: OracleContract[] = [
    ['eth_usd', '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419', 8],
    ['btc_usd', '0xf4030086522a5beea4988f8ca5b36dbc97bee88c', 8],
    ['dai_usd', '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9', 8],
    ['usdc_usd', '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6', 8],
    ['wbtc_btc', '0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23', 8],
    ['comp_eth', '0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699', 18],
    ['steth_usd', '0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8', 8],
    ['wsteth_usd', '0x8770d8dEb4Bc923bf929cd260280B5F1dd69564D', 18],
    ['bal_usd', '0xdF2917806E30300537aEB49A7663062F4d1F2b5F', 8],
  ];
  const calls = contracts.map(([key, address, decimals]) => {
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

async function run(opts: JobOptions): Promise<void> {
  try {
    provider = new providers.JsonRpcBatchProvider({
      url: `https://eth-mainnet.g.alchemy.com/v2/${opts.env.ALCHEMY_KEY}`,
      skipFetchSetup: true,
    });
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
        });
      })
    );
    console.log(
      `Scheduled response: ${JSON.stringify({ network, blockNumber, results })}`
    );
  } catch (e) {
    console.log(e);
  }
}

export const exchangeRateMonitorMainnet: MonitorJob = {
  run,
};
