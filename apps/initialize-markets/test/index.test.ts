import { Network, sendTxThroughRelayer } from '@notional-finance/util';
import { processMarket, Env } from '../src/index';
import { ethers, Signer } from 'ethers';
import { assert } from 'console';

assert(process.env.SUBGRAPH_API_KEY, "Env var SUBGRAPH_API_KEY needs to be set");

test('should initialize markets and settle all accounts', async () => {
  const network = Network.arbitrum;
  const blockNumber = 191470349;
  console.log(`Running test on Tenderly ${network} network at block: ${blockNumber}`);

  // this will run test on previously prepared fork on Tenderly "initialize-markets-test-3", in case fork was deleted you would
  // need to make new fork at `blockNumber`, then first make checkpoint and hardcode it in code so test can be run multiple times
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.tenderly.co/fork/d03656cb-12d0-42b6-bff8-87838279c625");
  // const checkpoint = await provider.send("evm_snapshot", []);
  // console.log(checkpoint)
  const checkpoint = '8413731b-0378-48fd-9a66-4e5b3062ae7f';
  await provider.send('evm_revert', [checkpoint]);
  // fund the signer
  await provider.send('tenderly_setBalance', [['0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B'], '0xad78ebc5ac6200000']);
  // address 0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B
  const wallet = new ethers.Wallet('0x2b61c05e8f3746694eb59fdf6ee07ab5c7ab918f05ffdcd13a45ac4fbeaaf773', provider);

  await processMarket(
    { NETWORK: network, SUBGRAPH_API_KEY: process.env.SUBGRAPH_API_KEY } as Env,
    provider,
    wallet.sendTransaction.bind(wallet),
    blockNumber
  );
}, 300_000);

// this test will be run directly over tx-relayer, rpc url in this test need to be set as sepolia rpc url in tx-relayer
test.skip('should initialize markets and settle all accounts via tx-relayer', async () => {
  assert(process.env.TX_RELAY_AUTH_TOKEN, "Env var TX_RELAY_AUTH_TOKEN needs to be set");
  const network = Network.arbitrum;
  const blockNumber = 191470349;
  console.log(`Running test on Tenderly ${network} network at block: ${blockNumber}`);

  // this will run test on previously prepared fork on Tenderly "initialize-markets-test", in case fork was deleted you would
  // need to make new fork at `blockNumber`, then first make checkpoint and hardcode it in code so test can be run multiple times
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.tenderly.co/fork/d03656cb-12d0-42b6-bff8-87838279c625");
  const checkpoint = '8413731b-0378-48fd-9a66-4e5b3062ae7f';
  await provider.send('evm_revert', [checkpoint]);

  // fund the signer
  await provider.send('tenderly_setBalance', [['0xBCf0fa01AB57c6E8ab322518Ad1b4b86778f08E1'], '0xad78ebc5ac6200000']);
  const env = {
    NETWORK: 'sepolia',
    TX_RELAY_AUTH_TOKEN: process.env.TX_RELAY_AUTH_TOKEN,
  }

  const sendTransaction = async (tx: { to: string, data: string, gasLimit?: number }) => {
    return sendTxThroughRelayer({ env: env as Env, ...tx, })
  };

  await processMarket(
    { NETWORK: network, SUBGRAPH_API_KEY: process.env.SUBGRAPH_API_KEY } as Env,
    provider,
    sendTransaction as any as Signer['sendTransaction'],
    blockNumber
  );
}, 300_000);
