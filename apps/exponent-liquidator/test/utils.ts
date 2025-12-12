import { spawn } from 'child_process';
import { ethers } from 'ethers';
import { ExponentFlashLiquidatorV2Artifact__factory } from '@notional-finance/contracts';

export class ForkManager {
  private anvilProcess: any = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async startFork(
    forkBlock: number,
    network: 'mainnet' | 'arbitrum'
  ): Promise<ethers.providers.JsonRpcProvider> {
    // Stop any existing fork
    await this.stopFork();

    const rpcUrl =
      network === 'mainnet'
        ? 'https://eth-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z'
        : 'https://arb-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z';

    console.log(`🔧 Starting fork at block ${forkBlock} on ${network}...`);

    return new Promise((resolve, reject) => {
      this.anvilProcess = spawn('anvil', [
        '--fork-url',
        rpcUrl,
        '--fork-block-number',
        forkBlock.toString(),
        '--port',
        '8545',
        '--host',
        '0.0.0.0',
      ]);

      this.anvilProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`anvil: ${output}`);

        if (output.includes('Listening on')) {
          this.provider = new ethers.providers.JsonRpcProvider(
            'http://127.0.0.1:8545'
          );
          resolve(this.provider);
        }
      });

      this.anvilProcess.stderr.on('data', (data: Buffer) => {
        console.error(`anvil error: ${data.toString()}`);
      });

      this.anvilProcess.on('error', (error: Error) => {
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.provider) {
          reject(new Error('Anvil fork startup timeout'));
        }
      }, 30000);
    });
  }

  async stopFork(): Promise<void> {
    if (this.anvilProcess) {
      console.log('🔧 Stopping anvil fork...');
      this.anvilProcess.kill();
      this.anvilProcess = null;
      this.provider = null;

      // Wait for process to fully stop
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  getProvider(): ethers.providers.JsonRpcProvider | null {
    return this.provider;
  }
}

export function validateTestResult(expected: any, actual: any): boolean {
  if (
    expected.totalTransactions !== undefined &&
    expected.totalTransactions !== actual.totalTransactions
  ) {
    return false;
  }

  if (expected.successfulTransactions !== actual.successfulTransactions) {
    return false;
  }

  if (
    expected.failedTransactions !== undefined &&
    expected.failedTransactions !== actual.failedTransactions
  ) {
    return false;
  }

  return true;
}

/**
 * Checks if a contract exists at the given address
 */
export async function contractExists(
  provider: ethers.providers.JsonRpcProvider,
  address: string
): Promise<boolean> {
  const code = await provider.getCode(address);
  return code !== '0x';
}

/**
 * Ensures the flash liquidator contract exists at the specified address.
 * If it doesn't exist (e.g., on an old fork block), deploys a new instance
 * and returns the deployed address.
 */
export async function ensureFlashLiquidatorDeployed(
  forkProvider: ethers.providers.JsonRpcProvider,
  flashLiquidatorAddress: string,
  _network: 'mainnet' | 'arbitrum'
): Promise<string> {
  // Check if contract already exists
  const exists = await contractExists(forkProvider, flashLiquidatorAddress);

  if (exists) {
    console.log(
      `✅ Flash liquidator already exists at ${flashLiquidatorAddress}`
    );
    return flashLiquidatorAddress;
  }

  console.log(
    `⚠️  Flash liquidator not found at ${flashLiquidatorAddress} on fork`
  );
  console.log(`🔨 Deploying FlashLiquidatorV2 contract...`);

  // Get an anvil test account as signer (anvil provides 10 pre-funded accounts)
  const signer = forkProvider.getSigner(0);

  // Deploy the contract using the TypeChain-generated factory
  const deployedContract = await new ExponentFlashLiquidatorV2Artifact__factory(
    signer
  ).deploy();
  await deployedContract.deployed();

  console.log(
    `✅ Flash liquidator deployed successfully at ${deployedContract.address}`
  );

  return deployedContract.address;
}
