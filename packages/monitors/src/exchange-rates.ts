import { getProviders } from './providers';
import { ethers } from 'ethers';
import { IAggregatorABI, IAggregator } from '@notional-finance/contracts';
import { aggregate } from '@notional-finance/multicall';
import { log } from '@notional-finance/logging';

let providers: Record<string, ethers.providers.JsonRpcBatchProvider> = {};

async function aggregateCalls() {
  const resp = await Promise.all(
    [...getCallMap().values()].map(async ({ provider, calls }) => {
      const { name } = await provider.getNetwork();
      if (calls.length === 0)
        return { network: name, blockNumber: 0, results: {} };
      const { blockNumber, results } = await aggregate(calls, provider);
      return { network: name, blockNumber, results };
    })
  );
  return resp
    .filter((data) => data.blockNumber > 0)
    .reduce(
      (prev, { network, blockNumber, results }) => ({
        ...prev,
        [network]: { blockNumber, results },
      }),
      {}
    );
}

function getCallMap(): Map<number, AggregateCallList> {
  const mainnetCalls: AggregateCall[] = [
    {
      target: new ethers.Contract(
        '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
        IAggregatorABI,
        providers.mainnet
      ),
      method: 'latestAnswer',
      args: [],
      key: 'eth_usd',
      transform: (r: Awaited<ReturnType<typeof IAggregator.latestAnswer>>) => {
        return r.toString();
      },
    },
    {
      target: new ethers.Contract(
        '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
        IAggregatorABI,
        providers.mainnet
      ),
      method: 'latestAnswer',
      args: [],
      key: 'btc_usd',
      transform: (r: Awaited<ReturnType<typeof IAggregator.latestAnswer>>) => {
        return r.toString();
      },
    },
  ];

  const goerliCalls: AggregateCall[] = [];

  const callMap = new Map<number, AggregateCallList>([
    [1, { provider: providers.mainnet, calls: mainnetCalls }],
    [5, { provider: providers.goerli, calls: goerliCalls }],
  ]);

  return callMap;
}

async function run(opts: JobOptions): Promise<void> {
  try {
    providers = getProviders(opts.env.ALCHEMY_KEY);
    const resp = await aggregateCalls();
    Object.keys(resp).forEach(async (network) => {
      const { blockNumber, results } = resp[network];
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
    });
    console.log(`Scheduled response: ${JSON.stringify(resp)}`);
  } catch (e) {
    console.log(e);
  }
}

export const exchangeRateMonitor: MonitorJob = {
  run,
};
