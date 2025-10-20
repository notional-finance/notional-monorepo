import ExponentLiquidator from './ExponentLiquidator';
import { Env } from './types';
import { fetchPositions } from './utils/dataService';
import { VaultRegistry } from './utils/vaultRegistry';
import { getProviderFromNetwork } from '@notional-finance/util';

async function createLiquidator(env: Env): Promise<ExponentLiquidator> {
  // Step 1: Fetch positions from data service
  const positions = await fetchPositions(
    env.DATA_SERVICE_URL,
    env.DATA_SERVICE_AUTH_TOKEN
  );
  
  // Step 2: Initialize vault registry with unique vault addresses
  const uniqueVaultAddresses = [...new Set(positions.map(([_, vault]) => vault))];
  const provider = getProviderFromNetwork(env.NETWORK, true);
  const vaultRegistry = await VaultRegistry.initialize(
    uniqueVaultAddresses,
    provider,
    env.NETWORK
  );
  
  // Step 3: Create liquidator with initialized dependencies
  return new ExponentLiquidator(env, positions, vaultRegistry);
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    try {
      const liquidator = await createLiquidator(env);
      const enrichedPositions = await liquidator.run();

      return new Response(
        JSON.stringify({
          riskyPositions: enrichedPositions.length,
          positions: enrichedPositions.map(position => ({
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
      const enrichedPositions = await liquidator.run();

      console.log(`Processed ${enrichedPositions.length} risky positions`);
      
      // TODO: Add liquidation logic here when requirements are defined
    } catch (e) {
      console.error('Scheduled liquidator error:', e);
    }
  },
};