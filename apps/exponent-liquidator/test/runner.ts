import { promises as fs } from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import ExponentLiquidator from '../src/ExponentLiquidator';
import { Network } from '@notional-finance/util';
import { LiquidationTestCase, TestResult, TestSuite, TestReport } from './types';
import { ForkManager, validateTestResult } from './utils';
import { VaultRegistry } from '../src/utils/vaultRegistry';

async function loadDevVars(): Promise<Record<string, string>> {
  try {
    const devVarsPath = path.join(__dirname, '../.dev.vars');
    const content = await fs.readFile(devVarsPath, 'utf-8');
    const vars: Record<string, string> = {};
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          vars[key] = valueParts.join('=');
        }
      }
    });
    
    return vars;
  } catch (error) {
    console.warn('Could not load .dev.vars file, using test defaults');
    return {};
  }
}

export class LiquidationTestRunner {
  private forkManager: ForkManager;

  constructor() {
    this.forkManager = new ForkManager();
  }

  async loadTestSuite(filePath: string): Promise<TestSuite> {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(fileContent) as TestSuite;
    } catch (error) {
      throw new Error(`Failed to load test suite from ${filePath}: ${error}`);
    }
  }

  async runTestCase(
    testCase: LiquidationTestCase, 
    overrideForkBlock?: number
  ): Promise<TestResult> {
    const forkBlock = overrideForkBlock || testCase.forkBlock;
    
    console.log(`\\n🧪 Running test: ${testCase.name}`);
    console.log(`📝 Description: ${testCase.description}`);
    console.log(`🔗 Fork block: ${forkBlock}`);
    console.log(`🌐 Network: ${testCase.network}`);
    console.log(`📍 Positions: ${testCase.positions.length}`);

    try {
      // Start fork at specified block
      const provider = await this.forkManager.startFork(forkBlock, testCase.network);
      
      // Load secrets from .dev.vars
      const devVars = await loadDevVars();
      
      // Set up environment
      const env = {
        MORPHO_LENDING_ROUTER_ADDRESS: testCase.network === 'mainnet' 
          ? '0x9a0c630c310030c4602d1a76583a3b16972ecaa0'
          : '0x9a0c630c310030c4602d1a76583a3b16972ecaa0',
        FLASH_LIQUIDATOR_ADDRESS: testCase.network === 'mainnet'
          ? '0x65b4ede768852C0359bAc066eC65CD2e1767eE75'
          : '0x65b4ede768852C0359bAc066eC65CD2e1767eE75',
        TRADING_MODULE_ADDRESS: testCase.network === 'mainnet'
          ? '0x594734c7e06C3D483466ADBCe401C6Bd269746C8'
          : '0x594734c7e06C3D483466ADBCe401C6Bd269746C8',
        NETWORK: testCase.network === 'mainnet' ? Network.mainnet : Network.arbitrum,
        DD_API_KEY: devVars.DD_API_KEY || 'test-key',
        TX_RELAY_AUTH_TOKEN: devVars.TX_RELAY_AUTH_TOKEN || 'test-token',
        HYPERNATIVE_CLIENT_ID: devVars.HYPERNATIVE_CLIENT_ID || 'test-id',
        HYPERNATIVE_CLIENT_SECRET: devVars.HYPERNATIVE_CLIENT_SECRET || 'test-secret'
      };

      // Initialize vault registry with unique vault addresses
      const uniqueVaultAddresses = [
        ...new Set(testCase.positions.map(([_, vault]) => vault)),
      ];
      console.log('🏛️  Initializing vault registry', {
        vaultCount: uniqueVaultAddresses.length,
        vaults: uniqueVaultAddresses,
        network: testCase.network
      });
      
      const vaultRegistry = await VaultRegistry.initialize(
        uniqueVaultAddresses,
        provider,
        env.NETWORK,
        env.MORPHO_LENDING_ROUTER_ADDRESS
      );
      console.log('✅ Vault registry initialized successfully');

      // Create liquidator instance
      const liquidator = new ExponentLiquidator(
        env,
        testCase.positions,
        vaultRegistry,
        provider,
        'development' // Use development mode to avoid actual transactions
      );

      // Run liquidation
      const result = await liquidator.run();

      // Validate results
      const actualResults = {
        successfulTransactions: result.liquidationReport.successfulTransactions,
        failedTransactions: result.liquidationReport.failedTransactions,
        totalTransactions: result.liquidationReport.totalTransactions
      };

      const success = validateTestResult(testCase.expectedResults, actualResults);

      console.log(`✅ Test ${success ? 'PASSED' : 'FAILED'}: ${testCase.name}`);
      console.log(`📊 Expected: ${JSON.stringify(testCase.expectedResults)}`);
      console.log(`📊 Actual: ${JSON.stringify(actualResults)}`);

      return {
        testCase,
        success,
        actualResults,
        error: success ? undefined : 'Results did not match expected values'
      };

    } catch (error) {
      console.log(`❌ Test FAILED with error: ${testCase.name}`);
      console.log(`💥 Error: ${error}`);

      return {
        testCase,
        success: false,
        actualResults: {
          successfulTransactions: 0,
          failedTransactions: 0,
          totalTransactions: 0
        },
        error: (error as Error).message
      };
    } finally {
      // Clean up fork
      await this.forkManager.stopFork();
    }
  }

  async runTestSuite(suite: TestSuite, overrideForkBlock?: number): Promise<TestResult[]> {
    console.log(`\\n🚀 Running test suite: ${suite.name}`);
    console.log(`📝 Description: ${suite.description}`);
    console.log(`🧪 Total tests: ${suite.testCases.length}`);

    const results: TestResult[] = [];

    for (const testCase of suite.testCases) {
      const result = await this.runTestCase(testCase, overrideForkBlock);
      results.push(result);
    }

    return results;
  }

  async generateReport(results: TestResult[]): Promise<TestReport> {
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passed,
      failed,
      testResults: results
    };

    console.log(`\\n📊 Test Report Summary:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log(`\\n❌ Failed tests:`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.testCase.name}: ${r.error}`);
      });
    }

    return report;
  }

  async cleanup(): Promise<void> {
    await this.forkManager.stopFork();
  }
}