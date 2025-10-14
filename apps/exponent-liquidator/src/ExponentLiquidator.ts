import { ethers } from 'ethers';
import { Logger, DDSeries, MetricType, getNowSeconds, getProviderFromNetwork } from '@notional-finance/util';
import { RiskyPosition, EnrichedPosition, Env, MetricNames } from './types';
import { fetchPositions } from './utils/dataService';
import { MorphoRouterIntegration } from './utils/morphoRouter';
import { batchWithdrawRequestStatus } from './utils/withdrawRequestData';
import { VaultRegistry } from './utils/vaultRegistry';

export default class ExponentLiquidator {
  private provider: ethers.providers.Provider;
  private morphoRouterIntegration: MorphoRouterIntegration;
  private logger: Logger;
  private vaultRegistry?: VaultRegistry;

  constructor(private env: Env) {
    this.provider = getProviderFromNetwork(env.NETWORK, true);
    this.morphoRouterIntegration = new MorphoRouterIntegration(
      this.provider,
      env.MORPHO_LENDING_ROUTER_ADDRESS
    );
    this.logger = new Logger({
      apiKey: env.DD_API_KEY,
      version: '1',
      env: env.NETWORK,
      service: 'exponent-liquidator',
    });
  }

  async getRiskyPositions(): Promise<RiskyPosition[]> {
    // Step 2: Get account/vault pairs from data service
    const positions = await fetchPositions(
      this.env.DATA_SERVICE_URL,
      this.env.DATA_SERVICE_AUTH_TOKEN
    );

    // Initialize vault registry with unique vault addresses
    const uniqueVaultAddresses = [...new Set(positions.map(([_, vault]) => vault))];
    this.vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      this.provider,
      this.env.NETWORK
    );

    // Step 3-5: Batch healthFactor calls and filter risky positions
    const riskyPositions = await this.morphoRouterIntegration.batchHealthFactors(positions);

    // Log metrics
    await this.logMetrics(positions.length, riskyPositions.length);

    return riskyPositions;
  }

  async enrichPositionData(positions: RiskyPosition[]): Promise<EnrichedPosition[]> {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call getRiskyPositions() first.');
    }

    // Step 6: Batch additional blockchain calls for position information
    
    // Get total vault shares for each position
    const totalVaultSharesArray = await this.morphoRouterIntegration.batchCollateralBalances(positions);
    
    // Get withdraw request status for each position (now with vault config)
    const withdrawRequestStatuses = await batchWithdrawRequestStatus(
      positions, 
      this.provider, 
      this.vaultRegistry
    );
    
    // Combine all data into enriched positions
    return positions.map((position, index) => ({
      ...position,
      totalVaultShares: totalVaultSharesArray[index],
      isWithdrawRequestPending: withdrawRequestStatuses[index].isWithdrawRequestPending,
      canWithdrawRequestFinalize: withdrawRequestStatuses[index].canWithdrawRequestFinalize,
    }));
  }

  private async logMetrics(totalPositions: number, riskyPositionCount: number): Promise<void> {
    const ddSeries: DDSeries = {
      series: [
        {
          metric: MetricNames.NUM_RISKY_ACCOUNTS,
          points: [
            {
              value: riskyPositionCount,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${this.env.NETWORK}`],
        },
        {
          metric: MetricNames.TOTAL_ACCOUNTS_PROCESSED,
          points: [
            {
              value: totalPositions,
              timestamp: getNowSeconds(),
            },
          ],
          type: MetricType.Gauge,
          tags: [`network:${this.env.NETWORK}`],
        },
      ],
    };

    await this.logger.submitMetrics(ddSeries);
  }

  async logRiskyPositionEvents(positions: RiskyPosition[]): Promise<void> {
    for (const position of positions) {
      await this.logger.submitEvent({
        aggregation_key: 'RiskyPosition',
        alert_type: 'info',
        host: 'cloudflare',
        network: this.env.NETWORK,
        title: `Risky Position Detected: ${position.account} in Vault: ${position.vault}`,
        tags: [`event:risky_position_detected`, `account:${position.account}`],
        text: `
account: ${position.account}
vault: ${position.vault}
healthFactor: ${position.healthFactor}
borrowed: ${position.borrowed.toString()}
collateralValue: ${position.collateralValue.toString()}
maxBorrow: ${position.maxBorrow.toString()}
        `,
      });
    }
  }
}