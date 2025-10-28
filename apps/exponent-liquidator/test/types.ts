import { Position } from '../src/types';

export interface LiquidationTestCase {
  name: string;
  description: string;
  forkBlock: number;
  network: 'mainnet' | 'arbitrum';
  positions: Position[]; // [account, vault] pairs
  expectedResults: {
    successfulTransactions: number;
    failedTransactions?: number;
    totalTransactions?: number;
  };
  timeout?: number; // in milliseconds, defaults to 60000
}

export interface TestResult {
  testCase: LiquidationTestCase;
  success: boolean;
  actualResults: {
    successfulTransactions: number;
    failedTransactions: number;
    totalTransactions: number;
  };
  error?: string;
}

export interface TestSuite {
  name: string;
  description: string;
  testCases: LiquidationTestCase[];
}

export interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  testResults: TestResult[];
}