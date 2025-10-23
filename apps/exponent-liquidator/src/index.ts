import { ethers } from 'ethers';
import ExponentLiquidator from './ExponentLiquidator';
import { Env, Position } from './types';
import { fetchPositions } from './utils/dataService';
import { VaultRegistry } from './utils/vaultRegistry';
import { getProviderFromNetwork } from '@notional-finance/util';
import { LiquidatorLogger } from './utils/logging';

async function createLiquidator(
  env: Env, 
  mockedPositions?: Position[], 
  customProvider?: ethers.providers.Provider,
  environment: 'development' | 'production' = 'production'
): Promise<ExponentLiquidator> {
  console.log('🔨 createLiquidator called', {
    hasMockedPositions: !!mockedPositions,
    hasCustomProvider: !!customProvider,
    network: env.NETWORK
  });
  
  const logger = new LiquidatorLogger(env);
  const provider = customProvider || getProviderFromNetwork(env.NETWORK, true);

  console.log('🔌 Provider configured', {
    isCustom: !!customProvider,
    providerUrl: customProvider ? 'custom' : 'network-default'
  });

  let positions: Position[];
  if (mockedPositions) {
    console.log('📋 Using mocked positions:', mockedPositions.length);
    positions = mockedPositions;
  } else {
    try {
      // Step 1: Fetch positions from Hypernative
      positions = await fetchPositions(
        env.HYPERNATIVE_CLIENT_ID,
        env.HYPERNATIVE_CLIENT_SECRET
      );
    } catch (error) {
      await logger.logError(
        'Fetching positions from Hypernative',
        (error as Error).message,
        {
          type: 'generic',
          data: {
            hypernativeUrl: 'https://api.hypernative.xyz/lists/6ac143d9-9d99-40f1-b26c-458361c695f3',
            network: env.NETWORK,
          },
        }
      );
      throw error;
    }
  }

  console.log(positions)
  let vaultRegistry: VaultRegistry;
  try {
    // Step 2: Initialize vault registry with unique vault addresses
    const uniqueVaultAddresses = [
      ...new Set(positions.map(([_, vault]) => vault)),
    ];
    console.log('🏛️  Initializing vault registry', {
      vaultCount: uniqueVaultAddresses.length,
      vaults: uniqueVaultAddresses,
      network: env.NETWORK
    });
    
    vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      provider,
      env.NETWORK
    );
    console.log('✅ Vault registry initialized successfully');
  } catch (error) {
    const uniqueVaultAddresses = [
      ...new Set(positions.map(([_, vault]) => vault)),
    ];
    await logger.logError(
      'Initializing vault registry',
      (error as Error).message,
      {
        type: 'vaultRegistry',
        data: {
          vaultAddresses: uniqueVaultAddresses,
          network: env.NETWORK,
        },
      }
    );
    throw error;
  }

  try {
    // Step 3: Create liquidator with initialized dependencies
    return new ExponentLiquidator(env, positions, vaultRegistry, provider, environment);
  } catch (error) {
    console.error('❌ Liquidator creation failed:', error);
    await logger.logError(
      'Creating ExponentLiquidator instance',
      (error as Error).message,
      {
        type: 'positions',
        data: positions,
      }
    );
    throw error;
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    
    // Test endpoint for mocked data and custom provider
    if (url.pathname === '/test') {
      try {
        console.log('🔧 Test endpoint called');
        const body = await request.json() as {
          positions: Position[];
          forkUrl: string;
          forkBlockNumber?: number;
        };

        console.log('📦 Received test payload:', {
          positionsCount: body.positions.length,
          forkUrl: body.forkUrl,
          network: env.NETWORK
        });

        // Create provider for the fork with explicit network configuration
        console.log('🌐 Creating custom provider for fork...');
        const customProvider = new ethers.providers.JsonRpcProvider({
          url: body.forkUrl,
          timeout: 30000,
          skipFetchSetup: true
        });
        
        console.log('🏗️  Creating liquidator with mocked positions...');
        const liquidator = await createLiquidator(env, body.positions, customProvider, 'development');
        
        console.log('🚀 Starting liquidator run...');
        const result = await liquidator.run();

        return new Response(
          JSON.stringify({
            summary: {
              totalPositionsProcessed: result.enrichedPositions.length,
              positionsToLiquidate: result.positionsToLiquidate.length,
              transactionsAttempted: result.liquidationReport.totalTransactions,
              transactionsSuccessful:
                result.liquidationReport.successfulTransactions,
              transactionsFailed: result.liquidationReport.failedTransactions,
            },
            liquidationReport: result.liquidationReport,
            positionsToLiquidate: result.positionsToLiquidate.map((position) => ({
              account: position.account,
              vault: position.vault,
              healthFactor: position.healthFactor,
              borrowed: position.borrowed.toString(),
              collateralShares: position.collateralShares.toString(),
              maxBorrow: position.maxBorrow.toString(),
              totalVaultShares: position.totalVaultShares.toString(),
              isWithdrawRequestPending: position.isWithdrawRequestPending,
              canWithdrawRequestFinalize: position.canWithdrawRequestFinalize,
            })),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (e) {
        console.error('Test liquidator error:', e);
        return new Response(`Test Error: ${(e as Error).message}`, { status: 500 });
      }
    }
    
    // Production endpoint
    try {
      const liquidator = await createLiquidator(env, undefined, undefined, 'production');
      const result = await liquidator.run();

      return new Response(
        JSON.stringify({
          summary: {
            totalPositionsProcessed: result.enrichedPositions.length,
            positionsToLiquidate: result.positionsToLiquidate.length,
            transactionsAttempted: result.liquidationReport.totalTransactions,
            transactionsSuccessful:
              result.liquidationReport.successfulTransactions,
            transactionsFailed: result.liquidationReport.failedTransactions,
          },
          liquidationReport: result.liquidationReport,
          positionsToLiquidate: result.positionsToLiquidate.map((position) => ({
            account: position.account,
            vault: position.vault,
            healthFactor: position.healthFactor,
            borrowed: position.borrowed.toString(),
            collateralShares: position.collateralShares.toString(),
            maxBorrow: position.maxBorrow.toString(),
            totalVaultShares: position.totalVaultShares.toString(),
            isWithdrawRequestPending: position.isWithdrawRequestPending,
            canWithdrawRequestFinalize: position.canWithdrawRequestFinalize,
          })),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (e) {
      console.error('Liquidator error:', e);
      return new Response(`Error: ${(e as Error).message}`, { status: 500 });
    }
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    try {
      const liquidator = await createLiquidator(env, undefined, undefined, 'production');
      const result = await liquidator.run();

      console.log(
        `Processed ${result.enrichedPositions.length} risky positions, attempted ${result.liquidationReport.totalTransactions} liquidations, ${result.liquidationReport.successfulTransactions} successful`
      );
    } catch (e) {
      console.error('Scheduled liquidator error:', e);
    }
  },
};
