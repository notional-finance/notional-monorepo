import { tokenBalanceMatchers } from './packages/token-balance/src';
import { spawn } from 'child_process';
import { ethers } from 'ethers';
import { initConsoleObservable } from '@datadog/browser-core';

require('dotenv').config();

expect.extend(tokenBalanceMatchers);

describe.withFork = (
  { blockNumber, network }: { blockNumber: number; network: string },
  name: string,
  fn: () => void
) => {
  const jsonRpcUrl = `https://eth-${network}.alchemyapi.io/v2/${process.env['ALCHEMY_API_KEY']}`;
  const forkProc = spawn(
    'anvil',
    ['--fork-url', jsonRpcUrl, '--fork-block-number', blockNumber.toString()],
    {
      cwd: undefined,
      // TODO: this env is not correct since it is inside the jest environment
      env: process.env,
      shell: true,
    }
  );

  const provider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8545'
  );
  (global as any).provider = provider;

  describe(name, () => {
    let initialSnapshot: string;

    beforeAll(async () => {
      await new Promise((r) => setTimeout(r, 750));

      const maxRetries = 5;
      let retries = 0;
      while (retries < maxRetries) {
        try {
          await provider.getBlockNumber();
          initialSnapshot = await provider.send('evm_snapshot', []);
          return;
        } catch (e) {
          retries += 1;
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      throw Error('Anvil did not startup');
    }, 10000);

    // Reset to initial snapshot
    beforeEach(async () => {
      await provider.send('evm_revert', [initialSnapshot]);
    });

    fn();

    afterAll(() => {
      // Cleanup anvil process
      forkProc.kill();
    });
  });
};
