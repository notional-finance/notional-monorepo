import { Network } from '@notional-finance/util/src/constants';
import { processMarket } from '../src/index';
import { ethers, JsonRpcProvider } from 'ethers-v6';

test('should initialize markets and settle all accounts', async () => {
  const network = Network.arbitrum;
  const blockNumber = 191471308;
  console.log(`Running test on Tenderly ${network} network at block: ${blockNumber}`);

  // spawn devNet initialize-markets-settle-accounts on Tenderly, fund account 0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B an copy RPC url here
  const provider = new JsonRpcProvider("<RPC url from Tenderly>");
  // address 0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B
  const wallet = new ethers.Wallet('0x2b61c05e8f3746694eb59fdf6ee07ab5c7ab918f05ffdcd13a45ac4fbeaaf773', provider);

  await processMarket(network, provider, wallet.sendTransaction.bind(wallet), blockNumber);
}, 300_000);
