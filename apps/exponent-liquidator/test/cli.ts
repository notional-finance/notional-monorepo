#!/usr/bin/env ts-node

import { Command } from 'commander';
import path from 'path';
import { LiquidationTestRunner } from './runner';

const program = new Command();

program
  .name('liquidation-test')
  .description('CLI for running liquidation tests')
  .version('1.0.0');

program
  .command('single')
  .description('Run a single test case by name')
  .argument('<suite-file>', 'Path to test suite file')
  .argument('<test-name>', 'Name of the test case to run')
  .option('-b, --fork-block <number>', 'Override fork block number')
  .action(async (suiteFile: string, testName: string, options: any) => {
    const runner = new LiquidationTestRunner();
    
    try {
      console.log(`🔍 Loading test suite: ${suiteFile}`);
      const suite = await runner.loadTestSuite(suiteFile);
      
      const testCase = suite.testCases.find(tc => tc.name === testName);
      if (!testCase) {
        console.error(`❌ Test case '${testName}' not found in suite`);
        console.log(`Available tests: ${suite.testCases.map(tc => tc.name).join(', ')}`);
        process.exit(1);
      }

      const forkBlock = options.forkBlock ? parseInt(options.forkBlock) : undefined;
      const result = await runner.runTestCase(testCase, forkBlock);
      
      await runner.generateReport([result]);
      process.exit(result.success ? 0 : 1);
      
    } catch (error) {
      console.error(`❌ Error running test: ${error}`);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  });

program
  .command('suite')
  .description('Run entire test suite')
  .argument('<suite-file>', 'Path to test suite file')
  .option('-b, --fork-block <number>', 'Override fork block number for all tests')
  .action(async (suiteFile: string, options: any) => {
    const runner = new LiquidationTestRunner();
    
    try {
      console.log(`🔍 Loading test suite: ${suiteFile}`);
      const suite = await runner.loadTestSuite(suiteFile);
      
      const forkBlock = options.forkBlock ? parseInt(options.forkBlock) : undefined;
      const results = await runner.runTestSuite(suite, forkBlock);
      
      const report = await runner.generateReport(results);
      process.exit(report.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error(`❌ Error running test suite: ${error}`);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  });

program
  .command('list')
  .description('List all test cases in a suite')
  .argument('<suite-file>', 'Path to test suite file')
  .action(async (suiteFile: string) => {
    const runner = new LiquidationTestRunner();
    
    try {
      const suite = await runner.loadTestSuite(suiteFile);
      
      console.log(`\\n📋 Test Suite: ${suite.name}`);
      console.log(`📝 Description: ${suite.description}`);
      console.log(`🧪 Total tests: ${suite.testCases.length}\\n`);
      
      suite.testCases.forEach((testCase, index) => {
        console.log(`${index + 1}. ${testCase.name}`);
        console.log(`   📝 ${testCase.description}`);
        console.log(`   🔗 Fork block: ${testCase.forkBlock}`);
        console.log(`   🌐 Network: ${testCase.network}`);
        console.log(`   📍 Positions: ${testCase.positions.length}`);
        console.log(`   ✅ Expected success: ${testCase.expectedResults.successfulTransactions}\\n`);
      });
      
    } catch (error) {
      console.error(`❌ Error loading test suite: ${error}`);
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

program.parse();