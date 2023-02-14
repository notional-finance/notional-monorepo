import { tokenBalanceMatchers } from './packages/token-balance/src';
import { spawn } from 'child_process';
import { ethers, Signer } from 'ethers';

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
          (global as any).whales = await setupWhales(provider);
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

async function setupWhales(provider: ethers.providers.JsonRpcProvider) {
  // prettier-ignore
  // [token, whale address]
  const whales = [
    // WETH
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xf8b721bFf6Bf7095a0E10791cE8f998baa254Fd0'],
    // wstETH
    ['0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', '0x67c89126fb7E793a2FaC54e0C4bD8baA53395767'],
  ];

  for (let [_, account] of whales) {
    await provider.send('anvil_impersonateAccount', [account]);
    // @note This only works for non-contract accounts
    await provider.send('anvil_setBalance', [
      account,
      '0xffffffffffffffffffffff',
    ]);
  }

  return new Map<string, Signer>(
    whales.map(([token, account]) => [token, provider.getSigner(account)])
  );
}
