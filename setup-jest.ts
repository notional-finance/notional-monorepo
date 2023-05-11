import { tokenBalanceMatchers } from './packages/core-entities/src';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Contract, ethers, Signer, Wallet } from 'ethers';
import { ERC20, ERC20ABI } from './packages/contracts/src';
import fetchMock from 'jest-fetch-mock';
import { AlchemyUrl, Network } from './packages/util/src';

require('dotenv').config();

fetchMock.enableMocks();
expect.extend(tokenBalanceMatchers);

(describe as any).withFork = (
  {
    blockNumber,
    network,
    useTokens = true,
  }: { blockNumber: number; network: Network; useTokens?: boolean },
  name: string,
  fn: () => void
) => {
  // NOTE: it is unreliable to spawn processes like this because anvil does not find the correct
  // environment variables to set snapshots
  const jsonRpcUrl = `${AlchemyUrl[network]}/pq08EwFvymYFPbDReObtP-SFw3bCes8Z`;
  let forkProc: undefined | ChildProcessWithoutNullStreams;
  // forkProc = spawn(
  //   'anvil',
  //   [
  //     '--fork-url',
  //     jsonRpcUrl,
  //     '--fork-block-number',
  //     blockNumber.toString(),
  //     '--port',
  //     '8546',
  //     // '--dump-state',
  //     // '/Users/jwu/code/notional-monorepo/state.json',
  //     '--load-state',
  //     '/Users/jwu/code/notional-monorepo/state.json',
  //   ],
  //   {
  //     cwd: __dirname,
  //     // TODO: this env is not correct since it is inside the jest environment
  //     env: {
  //       HOME: `${__dirname}`,
  //       PWD: `${__dirname}`,
  //       ...process.env,
  //     },
  //     shell: '/bin/zsh',
  //   }
  // );

  const provider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8546'
  );

  // Default signer will hold all tokens transferred from whales
  const signer = new Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  );
  (global as any).provider = provider;
  (global as any).signer = signer;

  describe(name, () => {
    let initialSnapshot: string;

    beforeAll((done) => {
      if (forkProc) {
        forkProc.stderr.on('data', (data) => {
          console.log(`anvil error: ${data}`);
        });

        forkProc.stdout.on('data', async (data) => {
          console.log(`anvil: ${data}`);
          if (data.includes('Listening on')) {
            initialSnapshot = await provider.send('evm_snapshot', []);
            done();
          }
        });
      } else {
        provider.send('evm_snapshot', []).then((i) => {
          initialSnapshot = i;
          done();
        });
      }
    }, 10000);

    fn();

    // Reset to snapshot
    afterEach(async () => {
      await provider.send('evm_revert', [initialSnapshot]);
    });

    afterAll(() => {
      // Cleanup anvil process
      if (forkProc) forkProc.kill();
    });
  });
};

async function setupWhales(
  signer: Signer,
  provider: ethers.providers.JsonRpcProvider
) {
  // prettier-ignore
  // [token, whale address]
  const whales = [
    // WETH
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0x2F0b23f53734252Bda2277357e97e1517d6B042A'],
    // wstETH
    ['0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', '0x67c89126fb7E793a2FaC54e0C4bD8baA53395767'],
  ];

  const signerAddress = await signer.getAddress();
  for (let [token, account] of whales) {
    await provider.send('anvil_impersonateAccount', [account]);
    await provider.send('anvil_setBalance', [
      account,
      '0xffffffffffffffffffffff',
    ]);

    const erc20 = new Contract(token, ERC20ABI, provider) as ERC20;
    const balance = await erc20.balanceOf(account);

    // Transfers 10% of the whale's balance to the account. Be careful about using
    // whales that tests are dependent on (i.e. Balancer Vault) or will run into weird
    // issues.
    await erc20
      .connect(provider.getSigner(account))
      .transfer(signerAddress, balance.mul(10).div(100));
  }

  return new Map<string, Signer>(
    whales.map(([token, account]) => [token, provider.getSigner(account)])
  );
}
