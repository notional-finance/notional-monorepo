import { ethers } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { 
  VaultConfig, 
  OnChainVaultConfig, 
  OffChainVaultConfig, 
  VaultType 
} from '../types';
import { 
  whitelistedVaults, 
  VaultDefaultDexParameters, 
  PendlePTVaults,
  PointsMultipliers,
  PointsLinks 
} from '@notional-finance/core-entities';

export class VaultRegistry {
  private vaultConfigs: Map<string, VaultConfig> = new Map();

  private constructor(
    private provider: ethers.providers.Provider,
    private network: Network
  ) {}

  static async initialize(
    vaultAddresses: string[],
    provider: ethers.providers.Provider,
    network: Network
  ): Promise<VaultRegistry> {
    const registry = new VaultRegistry(provider, network);
    await registry.loadVaultConfigs(vaultAddresses);
    return registry;
  }

  getVaultConfig(vaultAddress: string): VaultConfig | undefined {
    return this.vaultConfigs.get(vaultAddress.toLowerCase());
  }

  getAllVaultConfigs(): VaultConfig[] {
    return Array.from(this.vaultConfigs.values());
  }

  getVaultsByType(vaultType: VaultType): VaultConfig[] {
    return this.getAllVaultConfigs().filter(config => config.vaultType === vaultType);
  }

  private async loadVaultConfigs(vaultAddresses: string[]): Promise<void> {
    // Get unique vault addresses
    const uniqueVaults = [...new Set(vaultAddresses.map(addr => addr.toLowerCase()))];
    
    // Batch fetch on-chain data for all vaults
    const onChainConfigs = await this.batchFetchOnChainData(uniqueVaults);
    
    // Merge with off-chain data
    for (let i = 0; i < uniqueVaults.length; i++) {
      const vaultAddress = uniqueVaults[i];
      const onChainConfig = onChainConfigs[i];
      const offChainConfig = this.getOffChainConfig(vaultAddress);
      
      const fullConfig: VaultConfig = {
        address: vaultAddress,
        ...onChainConfig,
        ...offChainConfig,
      };
      
      this.vaultConfigs.set(vaultAddress, fullConfig);
    }
  }

  private async batchFetchOnChainData(vaultAddresses: string[]): Promise<OnChainVaultConfig[]> {
    // TODO: This will be replaced with actual contract calls
    // For now, create placeholder implementations based on vault types
    
    const calls: AggregateCall[] = [];
    
    // Add calls for each vault to get:
    // - vaultType (will need contract interface)
    // - asset
    // - yieldToken
    // - primaryWrm
    // - primaryWithdrawToken
    // - secondaryWrm (optional)
    // - secondaryWithdrawToken
    
    // Placeholder implementation - will be replaced with actual contract calls
    return vaultAddresses.map(address => {
      // Determine vault type based on whitelisted vaults patterns
      let vaultType: VaultType;
      if (PendlePTVaults[this.network]?.includes(address)) {
        vaultType = VaultType.PendlePT;
      } else if (address.includes('staking')) {
        vaultType = VaultType.Staking;
      } else {
        vaultType = VaultType.CurveConvex2Token;
      }
      
      return {
        vaultType,
        asset: '0x0000000000000000000000000000000000000000', // TODO: fetch from contract
        yieldToken: '0x0000000000000000000000000000000000000000', // TODO: fetch from contract
        primaryWrm: '0x0000000000000000000000000000000000000000', // TODO: fetch from contract
        primaryWithdrawToken: '0x0000000000000000000000000000000000000000', // TODO: fetch from contract
        secondaryWrm: undefined, // TODO: fetch from contract if exists
        secondaryWithdrawToken: '0x0000000000000000000000000000000000000000', // TODO: fetch from contract
      };
    });
  }

  private getOffChainConfig(vaultAddress: string): OffChainVaultConfig {
    const lowerAddress = vaultAddress.toLowerCase();
    
    // Get DEX parameters
    const dexParams = VaultDefaultDexParameters[this.network]?.[lowerAddress];
    
    // Check if it's a Pendle PT vault
    const isPendlePT = PendlePTVaults[this.network]?.includes(lowerAddress) || false;
    
    // Get points data
    const pointsMultipliersFn = PointsMultipliers[this.network]?.[lowerAddress];
    const pointsLinks = PointsLinks[this.network]?.[lowerAddress];
    
    return {
      dexId: dexParams?.dexId,
      depositExchangeData: dexParams?.depositExchangeData?.toString(),
      redeemExchangeData: dexParams?.redeemExchangeData?.toString(),
      withdrawExchangeData: dexParams?.withdrawExchangeData?.toString(),
      depositPoolAddress: dexParams?.depositPoolAddress,
      redeemPoolAddress: dexParams?.redeemPoolAddress,
      withdrawPoolAddress: dexParams?.withdrawPoolAddress,
      isPendlePT,
      pointsMultipliers: pointsMultipliersFn ? pointsMultipliersFn({} as any) : undefined,
      pointsLinks,
    };
  }
}