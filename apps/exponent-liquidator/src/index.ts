import ExponentLiquidator from './ExponentLiquidator';
import { Env } from './types';

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext
  ): Promise<Response> {
    try {
      const liquidator = new ExponentLiquidator(env);
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
      const liquidator = new ExponentLiquidator(env);
      const enrichedPositions = await liquidator.run();

      console.log(`Processed ${enrichedPositions.length} risky positions`);
      
      // TODO: Add liquidation logic here when requirements are defined
    } catch (e) {
      console.error('Scheduled liquidator error:', e);
    }
  },
};