import { ethers } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { RiskyPosition, VaultType, TokenPrice } from '../types';
import { VaultRegistry } from './vaultRegistry';
import { ERC20_ABI, TRADING_MODULE_ABI } from '../abis';
import { getTokenAddress } from '../constants';

export function getRequiredTokensForPricing(riskyPositions: RiskyPosition[], vaultRegistry: VaultRegistry): Set<string> {
  const requiredTokens = new Set<string>();
  
  // Get unique vaults from risky positions
  const uniqueVaults = [...new Set(riskyPositions.map(p => p.vault))];
  
  for (const vaultAddress of uniqueVaults) {
    const vaultConfig = vaultRegistry.getVaultConfig(vaultAddress);
    if (!vaultConfig) {
      console.warn(`Vault config not found for vault: ${vaultAddress}`);
      continue;
    }

    // Add common tokens for all vault types
    requiredTokens.add(vaultConfig.asset);
    requiredTokens.add(vaultConfig.yieldToken);
    requiredTokens.add(vaultConfig.primaryWithdrawToken);

    // Add vault-type specific tokens
    switch (vaultConfig.vaultType) {
      case VaultType.Staking:
        // For staking vaults: asset, yieldToken, primaryWithdrawToken (already added above)
        break;
        
      case VaultType.PendlePT:
        // For PT vaults: asset, yieldToken, tokenOutSy, primaryWithdrawToken
        if (vaultConfig.tokenOutSy) {
          requiredTokens.add(vaultConfig.tokenOutSy);
        }
        break;
        
      case VaultType.CurveConvex2Token:
        // For CurveConvex2Token vaults: asset, token0, token1, primaryWithdrawToken, secondaryWithdrawToken
        if (vaultConfig.token0) {
          requiredTokens.add(vaultConfig.token0);
        }
        if (vaultConfig.token1) {
          requiredTokens.add(vaultConfig.token1);
        }
        if (vaultConfig.secondaryWithdrawToken) {
          requiredTokens.add(vaultConfig.secondaryWithdrawToken);
        }
        break;
    }
  }

  return requiredTokens;
}

export async function batchFetchTokenPrices(
  tokens: Set<string>,
  provider: ethers.providers.Provider,
  tradingModule: ethers.Contract,
  network: Network
): Promise<Map<string, TokenPrice>> {
  const tokenArray = Array.from(tokens);
  console.log(`Fetching prices and decimals for ${tokenArray.length} tokens:`, tokenArray);
  
  // Build multicall calls for both prices and decimals
  const calls: AggregateCall[] = [];
  
  // Add price calls
  tokenArray.forEach((token, index) => {
    calls.push({
      stage: 0,
      target: tradingModule,
      method: 'getOraclePrice',
      args: [token, getTokenAddress(network, 'USDC')],
      key: `price_${index}`
    });
  });
  
  // Add decimals calls
  tokenArray.forEach((token, index) => {
    calls.push({
      stage: 0,
      target: new ethers.Contract(token, ERC20_ABI, provider),
      method: 'decimals',
      args: [],
      key: `decimals_${index}`
    });
  });
  
  try {
    // Execute batch fetch for prices and decimals
    const { results } = await aggregate(calls, provider);
    
    const priceMap = new Map<string, TokenPrice>();
    
    for (let i = 0; i < tokenArray.length; i++) {
      const token = tokenArray[i];
      const priceData = results[`price_${i}`] as [ethers.BigNumber];
      const decimalsData = results[`decimals_${i}`] as ethers.BigNumber;
      
      if (priceData && decimalsData) {
        console.log('🏗️  Price data:', priceData);
        console.log('🏗️  Decimals data:', decimalsData);
        const price = priceData[0];
        const decimals = decimalsData.toNumber();
        
        priceMap.set(token, {
          token,
          price: price,
          decimals: decimals
        });
        
        console.log(`Token ${token}: price=${price.toString()}, decimals=${decimals}`);
      }
    }
    
    return priceMap;
  } catch (error) {
    console.error('Error fetching token prices and decimals:', error);
    throw new Error(`Failed to fetch token prices and decimals: ${error}`);
  }
}

export async function getTokenPrices(
  riskyPositions: RiskyPosition[],
  vaultRegistry: VaultRegistry,
  provider: ethers.providers.Provider,
  tradingModule: ethers.Contract,
  network: Network
): Promise<Map<string, TokenPrice>> {
  // Step 1: Determine required tokens
  const requiredTokens = getRequiredTokensForPricing(riskyPositions, vaultRegistry);
  
  // Step 2: Batch fetch token prices
  const tokenPrices = await batchFetchTokenPrices(requiredTokens, provider, tradingModule, network);
  
  console.log(`Fetched prices for ${tokenPrices.size} tokens`);
  
  return tokenPrices;
}