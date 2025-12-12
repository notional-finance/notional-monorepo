import { ethers } from 'ethers';
import ExponentLiquidator from './ExponentLiquidator';
import { Env, Position } from './types';
import { fetchPositions } from './utils/dataService';
import { VaultRegistry } from './utils/vaultRegistry';
import { getProviderFromNetwork } from '@notional-finance/util';
import { logDebug, logInfo, logError } from './utils/logger';

async function createLiquidator(
  env: Env,
  mockedPositions?: Position[],
  customProvider?: ethers.providers.Provider,
  environment: 'development' | 'production' = 'production'
): Promise<ExponentLiquidator> {
  logDebug(
    'createLiquidator called',
    {
      hasMockedPositions: !!mockedPositions,
      hasCustomProvider: !!customProvider,
      network: env.NETWORK,
    },
    env.LOG_LEVEL
  );

  const provider = customProvider || getProviderFromNetwork(env.NETWORK, true);

  logDebug(
    'Provider configured',
    {
      isCustom: !!customProvider,
      providerUrl: customProvider ? 'custom' : 'network-default',
    },
    env.LOG_LEVEL
  );

  let positions: Position[];
  if (mockedPositions) {
    logDebug(
      'Using mocked positions',
      {
        positionsCount: mockedPositions.length,
      },
      env.LOG_LEVEL
    );
    positions = mockedPositions;
  } else {
    try {
      // Step 1: Fetch positions from Hypernative
      positions = await fetchPositions(
        env.HYPERNATIVE_CLIENT_ID,
        env.HYPERNATIVE_CLIENT_SECRET
      );
    } catch (error) {
      logError('Fetching positions from Hypernative', error as Error, {
        hypernativeUrl:
          'https://api.hypernative.xyz/lists/6ac143d9-9d99-40f1-b26c-458361c695f3',
        network: env.NETWORK,
      });
      throw error;
    }
  }

  logDebug(
    'Positions fetched',
    {
      positionsCount: positions.length,
    },
    env.LOG_LEVEL
  );

  let vaultRegistry: VaultRegistry;
  try {
    // Step 2: Initialize vault registry with unique vault addresses
    const uniqueVaultAddresses = [
      ...new Set(positions.map(([_, vault]) => vault)),
    ];
    logDebug(
      'Initializing vault registry',
      {
        vaultCount: uniqueVaultAddresses.length,
        vaults: uniqueVaultAddresses,
        network: env.NETWORK,
      },
      env.LOG_LEVEL
    );

    vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      provider,
      env.NETWORK,
      env.MORPHO_LENDING_ROUTER_ADDRESS
    );
    logDebug(
      'Vault registry initialized successfully',
      undefined,
      env.LOG_LEVEL
    );
  } catch (error) {
    const uniqueVaultAddresses = [
      ...new Set(positions.map(([_, vault]) => vault)),
    ];
    logError('Initializing vault registry', error as Error, {
      vaultAddresses: uniqueVaultAddresses,
      vaultCount: uniqueVaultAddresses.length,
      network: env.NETWORK,
    });
    throw error;
  }

  try {
    // Step 3: Create liquidator with initialized dependencies
    return new ExponentLiquidator(
      env,
      positions,
      vaultRegistry,
      provider,
      environment
    );
  } catch (error) {
    logError('Creating ExponentLiquidator instance', error as Error, {
      positionsCount: positions.length,
      network: env.NETWORK,
    });
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
        logDebug('Test endpoint called', undefined, env.LOG_LEVEL);
        const body = (await request.json()) as {
          positions: Position[];
          forkUrl: string;
          forkBlockNumber?: number;
        };

        logDebug(
          'Received test payload',
          {
            positionsCount: body.positions.length,
            forkUrl: body.forkUrl,
            network: env.NETWORK,
          },
          env.LOG_LEVEL
        );

        // Create provider for the fork with explicit network configuration
        logDebug('Creating custom provider for fork', undefined, env.LOG_LEVEL);
        const customProvider = new ethers.providers.JsonRpcProvider({
          url: body.forkUrl,
          timeout: 30000,
          skipFetchSetup: true,
        });

        logDebug(
          'Creating liquidator with mocked positions',
          undefined,
          env.LOG_LEVEL
        );
        const liquidator = await createLiquidator(
          env,
          body.positions,
          customProvider,
          'development'
        );

        logDebug('Starting liquidator run', undefined, env.LOG_LEVEL);
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
            positionsToLiquidate: result.positionsToLiquidate.map(
              (position) => ({
                account: position.account,
                vault: position.vault,
                healthFactor: position.healthFactor,
                borrowed: position.borrowed.toString(),
                collateralShares: position.collateralShares.toString(),
                maxBorrow: position.maxBorrow.toString(),
                isWithdrawRequestPending: position.isWithdrawRequestPending,
                canWithdrawRequestFinalize: position.canWithdrawRequestFinalize,
              })
            ),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (e) {
        logError('Test liquidator error', e as Error);
        return new Response(`Test Error: ${(e as Error).message}`, {
          status: 500,
        });
      }
    }

    // Production endpoint
    try {
      const liquidator = await createLiquidator(
        env,
        undefined,
        undefined,
        'production'
      );
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
            isWithdrawRequestPending: position.isWithdrawRequestPending,
            canWithdrawRequestFinalize: position.canWithdrawRequestFinalize,
          })),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (e) {
      logError('Liquidator error', e as Error);
      return new Response(`Error: ${(e as Error).message}`, { status: 500 });
    }
  },

  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _: ExecutionContext
  ): Promise<void> {
    try {
      const liquidator = await createLiquidator(
        env,
        undefined,
        undefined,
        'production'
      );
      const result = await liquidator.run();

      logInfo('Scheduled liquidation completed', {
        riskyPositionsCount: result.enrichedPositions.length,
        totalTransactions: result.liquidationReport.totalTransactions,
        successfulTransactions: result.liquidationReport.successfulTransactions,
        failedTransactions: result.liquidationReport.failedTransactions,
      });
    } catch (e) {
      logError('Scheduled liquidation failed', e as Error);
    }
  },
};
