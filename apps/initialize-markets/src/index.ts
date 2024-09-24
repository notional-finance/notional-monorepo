import {
  Network,
  sendTxThroughRelayer,
  getProviderFromNetwork,
} from '@notional-finance/util';
import Markets from './Markets';
import { ethers, Signer } from 'ethers';

export interface Env {
  NETWORKS: Array<Network>;
  NETWORK: Network;
  TX_RELAY_AUTH_TOKEN: string;
  AUTH_KEY: string;
  SUBGRAPH_API_KEY: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function findTx(provider: ethers.providers.Provider, hash: string) {
  const retryMax = 10;
  let retryNum = 0;
  while (retryNum++ < retryMax) {
    const tx = provider.getTransaction(hash);
    if (tx) return tx;
    await wait(3000);
  }
  throw new Error(`Unable to find tx ${hash}`);
}

export async function processMarket(
  env: Env,
  provider: ethers.providers.Provider,
  sendTransaction: Signer['sendTransaction'],
  blockNumber: number | null = null
) {
  const markets = new Markets(env.NETWORK, provider, env.SUBGRAPH_API_KEY);

  const shouldInitialize = await markets.checkInitializeAllMarkets();
  if (shouldInitialize) {
    console.log('Initializing all markets');
    const tx = await markets.getInitializeAllMarketsTx();

    const { hash } = await sendTransaction({
      to: tx.to,
      data: tx.data,
    });
    // make sure tx is visible on network before proceeding
    await findTx(provider, hash);
  }

  // skip account settlement on mainnet
  if (env.NETWORK === Network.mainnet) {
    return;
  }

  const txs = await markets.getAccountsSettlementTxs(blockNumber);
  const vaultTxs = await markets.getVaultAccountsSettlementTxs(blockNumber);

  for (const tx of txs) {
    console.log('Settling accounts');
    const { hash } = await sendTransaction({
      to: tx.to,
      data: tx.data,
      gasLimit: 30_000_000,
    });
    await wait(3000);
    // make sure tx is visible on network before proceeding
    await findTx(provider, hash);
  }
  for (const tx of vaultTxs) {
    console.log('Settling vault accounts');
    const { hash } = await sendTransaction({
      to: tx.to,
      data: tx.data,
    });
    await wait(3000);
    // make sure tx is visible on network before proceeding
    await findTx(provider, hash);
  }
}

async function run(env: Env) {
  for (const network of env.NETWORKS) {
    env.NETWORK = network;
    console.log(`Processing network: ${env.NETWORK}`);

    const provider = getProviderFromNetwork(network, true);
    const sendTransaction = (tx: {
      to: string;
      data: string;
      gasLimit?: number;
    }) => {
      return sendTxThroughRelayer({ env: env, ...tx });
    };

    await processMarket(
      env,
      provider,
      sendTransaction as unknown as Signer['sendTransaction']
    );
  }
}

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

    await run(env);

    return new Response('OK');
  },
  // this method can be only call by cloudflare internal system so it does not
  // require any authentication
  async scheduled(_: ScheduledController, env: Env): Promise<void> {
    await run(env);
  },
};
