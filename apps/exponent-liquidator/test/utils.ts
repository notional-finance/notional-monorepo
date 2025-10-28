import { spawn } from 'child_process';
import { ethers } from 'ethers';

export class ForkManager {
  private anvilProcess: any = null;
  private provider: ethers.providers.JsonRpcProvider | null = null;

  async startFork(forkBlock: number, network: 'mainnet' | 'arbitrum'): Promise<ethers.providers.JsonRpcProvider> {
    // Stop any existing fork
    await this.stopFork();

    const rpcUrl = network === 'mainnet' 
      ? 'https://eth-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z'
      : 'https://arb-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z';

    console.log(`🔧 Starting fork at block ${forkBlock} on ${network}...`);

    return new Promise((resolve, reject) => {
      this.anvilProcess = spawn('anvil', [
        '--fork-url', rpcUrl,
        '--fork-block-number', forkBlock.toString(),
        '--port', '8545',
        '--host', '0.0.0.0'
      ]);

      this.anvilProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`anvil: ${output}`);
        
        if (output.includes('Listening on')) {
          this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
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
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  getProvider(): ethers.providers.JsonRpcProvider | null {
    return this.provider;
  }
}

export function validateTestResult(expected: any, actual: any): boolean {
  if (expected.totalTransactions !== undefined && 
      expected.totalTransactions !== actual.totalTransactions) {
    return false;
  }
  
  if (expected.successfulTransactions !== actual.successfulTransactions) {
    return false;
  }
  
  if (expected.failedTransactions !== undefined && 
      expected.failedTransactions !== actual.failedTransactions) {
    return false;
  }
  
  return true;
}