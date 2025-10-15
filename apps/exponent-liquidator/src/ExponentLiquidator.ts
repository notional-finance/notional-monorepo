import { ethers } from 'ethers';
import { Logger, DDSeries, MetricType, getNowSeconds, getProviderFromNetwork } from '@notional-finance/util';
import { RiskyPosition, EnrichedPosition, Env, MetricNames, Position, HealthFactorData } from './types';
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

  async fetchPositions(): Promise<Position[]> {
    // Step 1: Get account/vault pairs from data service
    return await fetchPositions(
      this.env.DATA_SERVICE_URL,
      this.env.DATA_SERVICE_AUTH_TOKEN
    );
  }

  async initializeVaultRegistry(positions: Position[]): Promise<void> {
    // Initialize vault registry with unique vault addresses from positions
    const uniqueVaultAddresses = [...new Set(positions.map(([_, vault]) => vault))];
    this.vaultRegistry = await VaultRegistry.initialize(
      uniqueVaultAddresses,
      this.provider,
      this.env.NETWORK
    );
  }

  async getRiskyPositions(positions: Position[]): Promise<RiskyPosition[]> {
    // Step 2: Batch healthFactor calls to get raw health factor data
    const healthFactorData = await this.morphoRouterIntegration.batchHealthFactors(positions);

    // Step 3: Process results, calculate health factors, and filter risky positions
    const riskyPositions: RiskyPosition[] = [];

    for (const data of healthFactorData) {
      // Calculate health factor: maxBorrow / borrowed
      let healthFactor: number;
      if (data.borrowed.isZero()) {
        healthFactor = Number.MAX_SAFE_INTEGER; // No debt = healthy
      } else {
        healthFactor = data.maxBorrow.mul(1e18).div(data.borrowed).toNumber() / 1e18;
      }

      // Only include risky positions (healthFactor < 1)
      if (healthFactor < 1) {
        riskyPositions.push({
          account: data.account,
          vault: data.vault,
          borrowed: data.borrowed,
          collateralValue: data.collateralValue,
          maxBorrow: data.maxBorrow,
          healthFactor,
        });
      }
    }

    // Log metrics
    await this.logMetrics(positions.length, riskyPositions.length);

    return riskyPositions;
  }

  filterPositionsForLiquidation(enrichedPositions: EnrichedPosition[]): EnrichedPosition[] {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call run() or initializeVaultRegistry() first.');
    }

    const positionsToLiquidate: EnrichedPosition[] = [];

    for (const position of enrichedPositions) {
      const vaultConfig = this.vaultRegistry.getVaultConfig(position.vault);
      
      if (!vaultConfig) {
        console.warn(`Vault config not found for vault: ${position.vault}, skipping liquidation check`);
        continue;
      }

      // Check liquidation criteria
      if (!position.isWithdrawRequestPending && vaultConfig.liquidateYieldTokens === true) {
        // No withdraw request pending and vault allows yield token liquidation
        positionsToLiquidate.push(position);
      } else if (position.isWithdrawRequestPending && position.canWithdrawRequestFinalize) {
        // Withdraw request is pending and can be finalized
        positionsToLiquidate.push(position);
      }
    }

    return positionsToLiquidate;
  }

  private sortPositionsForLiquidation(positions: EnrichedPosition[]): Map<string, { withoutWithdrawRequest: EnrichedPosition[], withWithdrawRequest: EnrichedPosition[] }> {
    const sortedByVault = new Map<string, { withoutWithdrawRequest: EnrichedPosition[], withWithdrawRequest: EnrichedPosition[] }>();

    // Group positions by vault
    for (const position of positions) {
      if (!sortedByVault.has(position.vault)) {
        sortedByVault.set(position.vault, {
          withoutWithdrawRequest: [],
          withWithdrawRequest: []
        });
      }

      const vaultPositions = sortedByVault.get(position.vault)!;
      
      if (position.isWithdrawRequestPending) {
        vaultPositions.withWithdrawRequest.push(position);
      } else {
        vaultPositions.withoutWithdrawRequest.push(position);
      }
    }

    return sortedByVault;
  }

  private batchPositions<T>(positions: T[], batchSize: number = 5): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < positions.length; i += batchSize) {
      batches.push(positions.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private async generateLiquidationCallData(positions: EnrichedPosition[]): Promise<string> {
    // TODO: Implement liquidation call data generation
    // This will be replaced with actual flash liquidator call data generation
    console.log(`Generating liquidation call data for ${positions.length} positions`);
    return '0x'; // Placeholder
  }

  private async executeFlashLiquidation(callData: string): Promise<void> {
    // TODO: Implement flash liquidator contract call
    // This will be replaced with actual FLASH_LIQUIDATOR.flashLiquidate call
    console.log(`Executing flash liquidation with call data: ${callData}`);
  }

  async liquidatePositions(positionsToLiquidate: EnrichedPosition[]): Promise<void> {
    // Step 1: Sort positions by vault and withdraw request status
    const sortedPositions = this.sortPositionsForLiquidation(positionsToLiquidate);

    // Step 2: Process each vault
    for (const [vaultAddress, vaultPositions] of sortedPositions) {
      console.log(`Processing liquidations for vault: ${vaultAddress}`);

      // Step 3: Liquidate positions without withdraw requests (in batches)
      const batchesWithoutWithdrawRequest = this.batchPositions(vaultPositions.withoutWithdrawRequest, 5);
      
      for (const batch of batchesWithoutWithdrawRequest) {
        console.log(`Liquidating batch of ${batch.length} positions without withdraw requests`);
        const callData = await this.generateLiquidationCallData(batch);
        await this.executeFlashLiquidation(callData);
      }

      // Step 4: Liquidate positions with withdraw requests (one by one)
      for (const position of vaultPositions.withWithdrawRequest) {
        console.log(`Liquidating position with withdraw request: ${position.account}`);
        const callData = await this.generateLiquidationCallData([position]);
        await this.executeFlashLiquidation(callData);
      }

      console.log(`Completed liquidations for vault: ${vaultAddress}`);
    }

    console.log(`Completed liquidation of ${positionsToLiquidate.length} positions across ${sortedPositions.size} vaults`);
  }

  async run(): Promise<EnrichedPosition[]> {
    // Step 1: Fetch positions from data service
    const positions = await this.fetchPositions();
    
    // Step 2: Initialize vault registry with unique vault addresses
    await this.initializeVaultRegistry(positions);
    
    // Step 3: Get risky positions
    const riskyPositions = await this.getRiskyPositions(positions);
    
    // Step 4: Enrich position data
    const enrichedPositions = await this.enrichPositionData(riskyPositions);
    
    // Step 5: Log risky position events for monitoring
    await this.logRiskyPositionEvents(riskyPositions);

    return enrichedPositions;
  }

  async enrichPositionData(positions: RiskyPosition[]): Promise<EnrichedPosition[]> {
    if (!this.vaultRegistry) {
      throw new Error('Vault registry not initialized. Call run() or initializeVaultRegistry() first.');
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