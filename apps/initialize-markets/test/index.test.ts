import { Network } from '@notional-finance/util/src/constants';
import { processMarket } from '../src/index';
import { ethers } from 'ethers';

test('should initialize markets and settle all accounts', async () => {
  const network = Network.arbitrum;
  const blockNumber = 191471308;
  console.log(`Running test on Tenderly ${network} network at block: ${blockNumber}`);

  // this will run test on previously prepared fork on Tenderly "initialize-markets-test", in case fork was deleted you would
  // need to make new fork at `blockNumber`, then first make checkpoint and hardcode it in code so test can be run multiple times
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.tenderly.co/fork/051aceb1-7d58-4b33-a9fc-83bc00c87965");
  // const checkpoint = provider.send("evm_snapshot", []);
  const checkpoint = '43c14a31-79bf-4e29-8ea9-a82cb24299f3';
  await provider.send('evm_revert', [checkpoint]);
  // fund the signer
  await provider.send('tenderly_setBalance', [['0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B'], '0xad78ebc5ac6200000']);
  // address 0x0e2ec6218B896Fc7caF309492ae85B0D86891d1B
  const wallet = new ethers.Wallet('0x2b61c05e8f3746694eb59fdf6ee07ab5c7ab918f05ffdcd13a45ac4fbeaaf773', provider);

  await processMarket(network, provider, wallet.sendTransaction.bind(wallet), blockNumber);
}, 300_000);
