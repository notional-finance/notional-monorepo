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
  VaultDefaultDexParameters,
  VaultLiquidationSettings,
  DEFAULT_PT_SLIPPAGE_LIMIT
} from '../configs';
import {
  VAULT_ABI,
  ADDRESS_REGISTRY_ABI,
  WITHDRAW_REQUEST_MANAGER_ABI,
  PENDLE_PT_ABI,
  CURVE_CONVEX_2TOKEN_ABI
} from '../abis';
import { getContractAddress, getTokenAddress } from '../constants';

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
    console.log('🏗️ VaultRegistry.initialize starting with:', vaultAddresses);
    const registry = new VaultRegistry(provider, network);
    await registry.loadVaultConfigs(vaultAddresses);
    console.log('🏗️ VaultRegistry.initialize completed');
    return registry;
  }

  getVaultConfig(vaultAddress: string): VaultConfig | undefined {
    return this.vaultConfigs.get(vaultAddress.toLowerCase());
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
    const vaultInterface = new ethers.utils.Interface(VAULT_ABI);
    const addressRegistryInterface = new ethers.utils.Interface(ADDRESS_REGISTRY_ABI);
    const wrmInterface = new ethers.utils.Interface(WITHDRAW_REQUEST_MANAGER_ABI);
    const pendlePtInterface = new ethers.utils.Interface(PENDLE_PT_ABI);
    const curveConvexInterface = new ethers.utils.Interface(CURVE_CONVEX_2TOKEN_ABI);
    
    const calls: AggregateCall[] = [];
    
    // Add base vault calls for each vault
    for (const vaultAddress of vaultAddresses) {
      calls.push({
        target: new ethers.Contract(vaultAddress, vaultInterface, this.provider),
        stage: 0,
        method: 'strategy',
        key: `${vaultAddress}.strategy`
      });
      calls.push({
        target: new ethers.Contract(vaultAddress, vaultInterface, this.provider),
        stage: 0,
        method: 'asset',
        key: `${vaultAddress}.asset`
      });
      calls.push({
        target: new ethers.Contract(vaultAddress, vaultInterface, this.provider),
        stage: 0,
        method: 'yieldToken',
        key: `${vaultAddress}.yieldToken`
      });
      calls.push({
        target: new ethers.Contract(vaultAddress, vaultInterface, this.provider),
        stage: 0,
        method: 'convertSharesToYieldToken',
        args: [ethers.utils.parseUnits('1', 24)], // 1e24
        key: `${vaultAddress}.shareToYieldTokenExchangeRate`
      });
    }
    
    // Execute first stage to get basic vault data
    console.log('🔧 Stage 1: Executing basic vault data calls:', calls.length);
    const { results } = await aggregate(calls, this.provider);
    console.log('🔧 Stage 1: Results received:', Object.keys(results).length);
    
    // Prepare additional calls based on vault types
    const additionalCalls: AggregateCall[] = [];
    const vaultConfigs: Partial<OnChainVaultConfig>[] = [];
    
    for (const vaultAddress of vaultAddresses) {
      const vaultType = results[`${vaultAddress}.strategy`] as VaultType;
      const asset = results[`${vaultAddress}.asset`] as string;
      const yieldToken = results[`${vaultAddress}.yieldToken`] as string;
      const shareToYieldTokenExchangeRate = results[`${vaultAddress}.shareToYieldTokenExchangeRate`] as ethers.BigNumber;
      
      vaultConfigs.push({
        vaultType,
        asset,
        yieldToken,
        shareToYieldTokenExchangeRate
      });
      
      // Add calls based on vault type
      if (vaultType === VaultType.Staking) {
        // For Staking vaults: primaryWrm = AddressRegistry.withdrawRequestManagers[yieldToken]
        additionalCalls.push({
          target: new ethers.Contract(getContractAddress(this.network, 'ADDRESS_REGISTRY')!, addressRegistryInterface, this.provider),
          stage: 1,
          method: 'withdrawRequestManagers',
          args: [yieldToken],
          key: `${vaultAddress}.primaryWrm`
        });
      } else if (vaultType === VaultType.PendlePT) {
        // For PendlePT vaults: get TOKEN_OUT_SY, MARKET, and PT
        additionalCalls.push({
          target: new ethers.Contract(vaultAddress, pendlePtInterface, this.provider),
          stage: 1,
          method: 'TOKEN_OUT_SY',
          key: `${vaultAddress}.tokenOutSy`
        });
        additionalCalls.push({
          target: new ethers.Contract(vaultAddress, pendlePtInterface, this.provider),
          stage: 1,
          method: 'MARKET',
          key: `${vaultAddress}.marketAddress`
        });
        additionalCalls.push({
          target: new ethers.Contract(vaultAddress, pendlePtInterface, this.provider),
          stage: 1,
          method: 'PT',
          key: `${vaultAddress}.ptAddress`
        });
      } else if (vaultType === VaultType.CurveConvex2Token) {
        // For CurveConvex2Token vaults: get TOKENS and PRIMARY_INDEX
        console.log('🔧 Adding TOKENS call for vault:', vaultAddress);
        
        // Test direct call first to debug ABI issue
        try {
          const directContract = new ethers.Contract(vaultAddress, curveConvexInterface, this.provider);
          console.log('🔧 Testing direct TOKENS call...');
          const directResult = await directContract.TOKENS();
          console.log('🔧 Direct TOKENS result:', directResult);
          console.log('🔧 Direct TOKENS result type:', typeof directResult);
          console.log('🔧 Direct TOKENS result length:', directResult?.length);
        } catch (error) {
          console.log('🔧 Direct TOKENS call failed:', error);
        }
        
        additionalCalls.push({
          target: new ethers.Contract(vaultAddress, curveConvexInterface, this.provider),
          stage: 1,
          method: 'TOKENS',
          key: `${vaultAddress}.tokens`
        });
        additionalCalls.push({
          target: new ethers.Contract(vaultAddress, curveConvexInterface, this.provider),
          stage: 1,
          method: 'PRIMARY_INDEX',
          key: `${vaultAddress}.primaryIndex`
        });
      }
    }
    
    // Add additional calls to the existing calls array
    calls.push(...additionalCalls);
    
    // Execute again to get vault-specific data
    console.log('🔧 Stage 2: Executing vault-specific calls:', calls.length);
    const { results: results2 } = await aggregate(calls, this.provider);
    console.log('🔧 Stage 2: Results received:', results2);
    
    // Prepare final calls for WRM addresses and withdraw tokens
    const finalCalls: AggregateCall[] = [];
    
    for (let i = 0; i < vaultAddresses.length; i++) {
      const vaultAddress = vaultAddresses[i];
      const config = vaultConfigs[i];
      
      if (config.vaultType === VaultType.Staking) {
        const primaryWrm = results2[`${vaultAddress}.primaryWrm`] as string;
        vaultConfigs[i].primaryWrm = primaryWrm;
        
        // Add call to get withdraw token
        finalCalls.push({
          target: new ethers.Contract(primaryWrm, wrmInterface, this.provider),
          stage: 2,
          method: 'WITHDRAW_TOKEN',
          key: `${vaultAddress}.primaryWithdrawToken`
        });
      } else if (config.vaultType === VaultType.PendlePT) {
        const tokenOutSy = results2[`${vaultAddress}.tokenOutSy`] as string;
        const marketAddress = results2[`${vaultAddress}.marketAddress`] as string;
        const ptAddress = results2[`${vaultAddress}.ptAddress`] as string;
        vaultConfigs[i].tokenOutSy = tokenOutSy;
        vaultConfigs[i].marketAddress = marketAddress;
        vaultConfigs[i].ptAddress = ptAddress;
        
        // Get primaryWrm from AddressRegistry
        finalCalls.push({
          target: new ethers.Contract(getContractAddress(this.network, 'ADDRESS_REGISTRY')!, addressRegistryInterface, this.provider),
          stage: 2,
          method: 'withdrawRequestManagers',
          args: [tokenOutSy],
          key: `${vaultAddress}.primaryWrm`
        });
      } else if (config.vaultType === VaultType.CurveConvex2Token) {
        const tokens = results2[`${vaultAddress}.tokens`] as [string, string];
        const primaryIndex = results2[`${vaultAddress}.primaryIndex`] as ethers.BigNumber;
        const token0 = tokens[0] === ethers.constants.AddressZero ? getTokenAddress(this.network, 'WETH')! : tokens[0];
        const token1 = tokens[1] === ethers.constants.AddressZero ? getTokenAddress(this.network, 'WETH')! : tokens[1];
        
        vaultConfigs[i].token0 = token0;
        vaultConfigs[i].token1 = token1;
        console.log('🔧 tokens:', tokens);
        console.log('🔧 token0:', token0);
        console.log('🔧 token1:', token1);
        vaultConfigs[i].primaryIndex = primaryIndex.toNumber();
        
        // Get both WRMs from AddressRegistry
        finalCalls.push({
          target: new ethers.Contract(getContractAddress(this.network, 'ADDRESS_REGISTRY')!, addressRegistryInterface, this.provider),
          stage: 2,
          method: 'withdrawRequestManagers',
          args: [token0],
          key: `${vaultAddress}.primaryWrm`
        });
        finalCalls.push({
          target: new ethers.Contract(getContractAddress(this.network, 'ADDRESS_REGISTRY')!, addressRegistryInterface, this.provider),
          stage: 2,
          method: 'withdrawRequestManagers',
          args: [token1],
          key: `${vaultAddress}.secondaryWrm`
        });
      }
    }
    
    // Add final calls and execute to get WRM addresses
    calls.push(...finalCalls);
    console.log('🔧 Stage 3: Executing WRM address calls:', calls.length);
    const { results: results3 } = await aggregate(calls, this.provider);
    console.log('🔧 Stage 3: Results received:', Object.keys(results3).length);
    
    // Prepare calls to get withdraw tokens
    const withdrawTokenCalls: AggregateCall[] = [];
    
    for (let i = 0; i < vaultAddresses.length; i++) {
      const vaultAddress = vaultAddresses[i];
      const config = vaultConfigs[i];
      
      if (config.vaultType === VaultType.Staking) {
        config.primaryWithdrawToken = results3[`${vaultAddress}.primaryWithdrawToken`] as string;
      } else if (config.vaultType === VaultType.PendlePT) {
        const primaryWrm = results3[`${vaultAddress}.primaryWrm`] as string;
        vaultConfigs[i].primaryWrm = primaryWrm;
        
        // Add call to get withdraw token
        withdrawTokenCalls.push({
          target: new ethers.Contract(primaryWrm, wrmInterface, this.provider),
          stage: 3,
          method: 'WITHDRAW_TOKEN',
          key: `${vaultAddress}.primaryWithdrawToken`
        });
      } else if (config.vaultType === VaultType.CurveConvex2Token) {
        const primaryWrm = results3[`${vaultAddress}.primaryWrm`] as string;
        const secondaryWrm = results3[`${vaultAddress}.secondaryWrm`] as string;
        
        vaultConfigs[i].primaryWrm = primaryWrm;
        vaultConfigs[i].secondaryWrm = secondaryWrm;
        
        // Add calls to get both withdraw tokens
        withdrawTokenCalls.push({
          target: new ethers.Contract(primaryWrm, wrmInterface, this.provider),
          stage: 3,
          method: 'WITHDRAW_TOKEN',
          key: `${vaultAddress}.primaryWithdrawToken`
        });
        withdrawTokenCalls.push({
          target: new ethers.Contract(secondaryWrm, wrmInterface, this.provider),
          stage: 3,
          method: 'WITHDRAW_TOKEN',
          key: `${vaultAddress}.secondaryWithdrawToken`
        });
      }
    }
    
    // Execute final calls to get withdraw tokens if needed
    if (withdrawTokenCalls.length > 0) {
      calls.push(...withdrawTokenCalls);
      console.log('🔧 Stage 4: Executing withdraw token calls:', withdrawTokenCalls.length);
      console.log('🔧 Stage 4: Withdraw token calls detail:', withdrawTokenCalls.map(c => ({ target: c.target?.address, method: c.method, key: c.key })));
      const { results: finalResults } = await aggregate(calls, this.provider);
      console.log('🔧 Stage 4: Results received:', Object.keys(finalResults).length);
      
      // Parse withdraw token results
      for (let i = 0; i < vaultAddresses.length; i++) {
        const vaultAddress = vaultAddresses[i];
        const config = vaultConfigs[i];
        console.log(`🔧 Parsing results for vault ${i}: ${vaultAddress}`);
        
        if (config.vaultType === VaultType.PendlePT) {
          config.primaryWithdrawToken = finalResults[`${vaultAddress}.primaryWithdrawToken`] as string;
        } else if (config.vaultType === VaultType.CurveConvex2Token) {
          config.primaryWithdrawToken = finalResults[`${vaultAddress}.primaryWithdrawToken`] as string;
          config.secondaryWithdrawToken = finalResults[`${vaultAddress}.secondaryWithdrawToken`] as string;
        }
      }
    }
    
    return vaultConfigs as OnChainVaultConfig[];
  }

  private getOffChainConfig(vaultAddress: string): OffChainVaultConfig {
    const lowerAddress = vaultAddress.toLowerCase();
    
    // Get DEX parameters
    const dexParams = VaultDefaultDexParameters[this.network]?.[lowerAddress];
    
    // Get liquidation settings
    const liquidationSettings = VaultLiquidationSettings[this.network]?.[lowerAddress];
    
    return {
      dexId: dexParams?.dexId,
      redeemExchangeData: dexParams?.redeemExchangeData?.toString(),
      withdrawExchangeData: dexParams?.withdrawExchangeData?.toString(),
      redeemPoolAddress: dexParams?.redeemPoolAddress,
      withdrawPoolAddress: dexParams?.withdrawPoolAddress,
      liquidateYieldTokens: liquidationSettings?.liquidateYieldTokens,
      slippageLimit: liquidationSettings?.slippageLimit,
      ptSlippageLimit: liquidationSettings?.ptSlippageLimit || DEFAULT_PT_SLIPPAGE_LIMIT,
    };
  }
}