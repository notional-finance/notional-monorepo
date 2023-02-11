import { tokenBalanceMatchers } from './packages/token-balance/src';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { ethers } from 'ethers';

require('dotenv').config();
let forkProc: ChildProcessWithoutNullStreams | undefined;

expect.extend(tokenBalanceMatchers);
describe.withFork = (
  { blockNumber, network }: { blockNumber: number; network: string },
  name: string,
  fn: () => void
) => {
  const jsonRpcUrl = `https://eth-${network}.alchemyapi.io/v2/${process.env['ALCHEMY_API_KEY']}`;
  forkProc = spawn('anvil', [
    '--fork-url',
    jsonRpcUrl,
    '--fork-block-number',
    blockNumber.toString(),
  ]);

  (global as any).provider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8545'
  );

  describe(name, () => {
    beforeAll(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });
    fn();
  });
};

afterAll(() => {
  // Cleanup anvil if still running
  forkProc?.kill();
});
