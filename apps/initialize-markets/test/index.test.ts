import {
  Network,
  sendTxThroughRelayer,
  NetworkId,
} from '@notional-finance/util';
import { processMarket, Env } from '../src/index';
import { ethers, Signer } from 'ethers';
import { assert } from 'console';

assert(
  process.env.SUBGRAPH_API_KEY && process.env.TENDERLY_ACCESS_KEY,
  'Env var SUBGRAPH_API_KEY and TENDERLY_ACCESS_KEY needs to be set'
);

interface TenderlyVirtualNetwork {
  id: string;
  rpcs: Array<{
    url: string;
    name: string;
  }>;
}

const tenderly = {
  accountSlug: 'notional-finance',
  projectSlug: 'notionalv2',
  vnetSlug: 'initialize-markets-test',
};

const createVirtualNetwork = async (
  network: Network,
  blockNumber: number
): Promise<TenderlyVirtualNetwork> => {
  const response = await fetch(
    `https://api.tenderly.co/api/v1/account/${tenderly.accountSlug}/project/${tenderly.projectSlug}/vnets`,
    {
      method: 'POST',
      headers: {
        'X-Access-Key': process.env.TENDERLY_ACCESS_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: `${tenderly.vnetSlug}-${network}-${Date.now()}`,
        fork_config: {
          network_id: NetworkId[network],
          block_number: blockNumber,
        },
        virtual_network_config: {
          chain_config: {
            chain_id: 111111,
          },
        },
      }),
    }
  );
  return response.json();
};
const deleteVirtualNetwork = async (vnetId: string): Promise<void> => {
  const response = await fetch(
    `https://api.tenderly.co/api/v1/account/${tenderly.accountSlug}/project/${tenderly.projectSlug}/vnets/${vnetId}`,
    {
      method: 'DELETE',
      headers: {
        'X-Access-Key': process.env.TENDERLY_ACCESS_KEY,
        Accept: 'application/json',
      },
    }
  );

  if (response.ok) {
    console.log('Virtual network deleted');
  } else {
    throw new Error(`Failed to delete virtual network: ${response.statusText}`);
  }
};

test.skip('should initialize markets and settle all accounts', async () => {
  // const network = Network.mainnet;
  // const blockNumber = 19458011;
  const network = Network.arbitrum;
  const blockNumber = 191470349;
  const { id: vnetId, rpcs } = await createVirtualNetwork(network, blockNumber);
  const adminRpc = rpcs.find((rpc) => rpc.name === 'Admin RPC').url;

  console.log(
    `Running test on Tenderly ${network} network at block: ${blockNumber}, adminRpc: ${adminRpc}`
  );

  const provider = new ethers.providers.JsonRpcProvider(adminRpc);
  // fund the signer
  await provider.send('tenderly_setBalance', [
    ['0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B'],
    '0xad78ebc5ac6200000',
  ]);
  // address 0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B
  const wallet = new ethers.Wallet(
    '0x2b61c05e8f3746694eb59fdf6ee07ab5c7ab918f05ffdcd13a45ac4fbeaaf773',
    provider
  );

  await processMarket(
    { NETWORK: network, SUBGRAPH_API_KEY: process.env.SUBGRAPH_API_KEY } as Env,
    provider,
    wallet.sendTransaction.bind(wallet),
    blockNumber
  );

  await deleteVirtualNetwork(vnetId);
}, 300_000);

// this test will be run directly over tx-relayer, rpc url in this test need to be set as sepolia rpc url in tx-relayer
test('should initialize markets and settle all accounts via tx-relayer', async () => {
  assert(
    process.env.TX_RELAY_AUTH_TOKEN,
    'Env var TX_RELAY_AUTH_TOKEN needs to be set'
  );
  const network = Network.arbitrum;
  const blockNumber = 222278430;

  const { id: vnetId, rpcs } = await createVirtualNetwork(network, blockNumber);
  const adminRpc = rpcs.find((rpc) => rpc.name === 'Admin RPC').url;
  const publicRpc = rpcs.find((rpc) => rpc.name === 'Public RPC').url;
  console.log(
    `Running test on Tenderly ${network} network at block: ${blockNumber}`
  );

  const provider = new ethers.providers.JsonRpcProvider(adminRpc);

  // fund the signer
  await provider.send('tenderly_setBalance', [
    ['0xBCf0fa01AB57c6E8ab322518Ad1b4b86778f08E1'],
    '0xad78ebc5ac6200000',
  ]);
  const env = {
    NETWORK: Network.arbitrum,
    TX_RELAY_AUTH_TOKEN: process.env.TX_RELAY_AUTH_TOKEN,
    RPC_URL: publicRpc,
  };

  const sendTransaction = async (tx: {
    to: string;
    data: string;
    gasLimit?: number;
  }) => {
    return sendTxThroughRelayer({ env, ...tx });
  };

  await processMarket(
    { NETWORK: network, SUBGRAPH_API_KEY: process.env.SUBGRAPH_API_KEY } as Env,
    provider,
    sendTransaction as unknown as Signer['sendTransaction'],
    blockNumber
  );

  await deleteVirtualNetwork(vnetId);
}, 300_000);
