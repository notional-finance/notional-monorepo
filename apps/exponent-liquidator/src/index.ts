import ExponentLiquidator from './ExponentLiquidator';
import { Env, Position } from './types';
import { fetchPositions } from './utils/dataService';
import { VaultRegistry } from './utils/vaultRegistry';
import { getProviderFromNetwork } from '@notional-finance/util';
import { LiquidatorLogger } from './utils/logging';

async function createLiquidator(env: Env): Promise<ExponentLiquidator> {
  const logger = new LiquidatorLogger(env);

  let positions: Position[];
  try {
    // Step 1: Fetch positions from data service
    positions = await fetchPositions(
      env.DATA_SERVICE_URL,
      env.DATA_SERVICE_AUTH_TOKEN
    );
  } catch (error) {
    await logger.logError(
      'Fetching positions from data service',
      (error as Error).message,
      {
        type: 'generic',
        data: {
          dataServiceUrl: env.DATA_SERVICE_URL,
          network: env.NETWORK,
        },
      }
    );
    throw error;
  }

  let vaultRegistry: VaultRegistry;
  try {
    // Step 2: Initialize vault registry with unique vault addresses
    const uniqueVaultAddresses = [
      ...new Set(positions.map(([_, vault]) => vault)),
    ];
    const provider = getProviderFromNetwork(env.NETWORK, true);
    vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      provider,
      env.NETWORK
    );
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
    return new ExponentLiquidator(env, positions, vaultRegistry);
  } catch (error) {
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
    try {
      const liquidator = await createLiquidator(env);
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
      const liquidator = await createLiquidator(env);
      const result = await liquidator.run();

      console.log(
        `Processed ${result.enrichedPositions.length} risky positions, attempted ${result.liquidationReport.totalTransactions} liquidations, ${result.liquidationReport.successfulTransactions} successful`
      );
    } catch (e) {
      console.error('Scheduled liquidator error:', e);
    }
  },
};
