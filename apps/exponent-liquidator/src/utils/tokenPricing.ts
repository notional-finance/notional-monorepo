import { ethers } from 'ethers';
import { aggregate, AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { RiskyPosition, VaultType, TokenPrice } from '../types';
import { VaultRegistry } from './vaultRegistry';
import { ERC20__factory } from '@notional-finance/contracts';
import { getTokenAddress } from '../constants';
import { logError } from './logger';
export function getRequiredTokensForPricing(
  riskyPositions: RiskyPosition[],
  vaultRegistry: VaultRegistry
) {
  const requiredTokens = new Set<string>();
  const curveConvex2TokenYieldTokens = new Set<string>();

  // Get unique vaults from risky positions
  const uniqueVaults = [...new Set(riskyPositions.map((p) => p.vault))];

  for (const vaultAddress of uniqueVaults) {
    const vaultConfig = vaultRegistry.getVaultConfig(vaultAddress);
    if (!vaultConfig) {
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
        // Note: yieldToken for CurveConvex2Token doesn't implement decimals(), so we track it separately
        curveConvex2TokenYieldTokens.add(vaultConfig.yieldToken);

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

  return { requiredTokens, curveConvex2TokenYieldTokens };
}

export async function batchFetchTokenPrices(
  tokens: Set<string>,
  curveConvex2TokenYieldTokens: Set<string>,
  provider: ethers.providers.Provider,
  tradingModule: ethers.Contract,
  network: Network
): Promise<Map<string, TokenPrice>> {
  const tokenArray = Array.from(tokens);

  // Build multicall calls for both prices and decimals
  const calls: AggregateCall[] = [];

  // Add price calls
  tokenArray.forEach((token, index) => {
    calls.push({
      stage: 0,
      target: tradingModule,
      method: 'getOraclePrice',
      args: [token, getTokenAddress(network, 'USDC')],
      key: `price_${index}`,
      transform: (priceData: [ethers.BigNumber]) => priceData[0],
    });
  });

  // Add decimals calls (skip for CurveConvex2Token yieldTokens)
  tokenArray.forEach((token, index) => {
    if (!curveConvex2TokenYieldTokens.has(token)) {
      calls.push({
        stage: 0,
        target: ERC20__factory.connect(token, provider),
        method: 'decimals',
        args: [],
        key: `decimals_${index}`,
      });
    }
  });

  try {
    // Execute batch fetch for prices and decimals
    const { results } = await aggregate(calls, provider);

    const priceMap = new Map<string, TokenPrice>();

    for (let i = 0; i < tokenArray.length; i++) {
      const token = tokenArray[i];
      const price: ethers.BigNumber = results[`price_${i}`] as ethers.BigNumber;

      // For CurveConvex2Token yieldTokens, hardcode decimals to 18
      let decimals: number;
      if (curveConvex2TokenYieldTokens.has(token)) {
        decimals = 18;
      } else {
        decimals = results[`decimals_${i}`] as number;
        if (!decimals) {
          continue;
        }
      }

      if (price) {
        priceMap.set(token, {
          token,
          price: price,
          decimals: decimals,
        });
      }
    }

    return priceMap;
  } catch (error) {
    logError('Error fetching token prices and decimals', error as Error);
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
  // Step 1: Determine required tokens and identify CurveConvex2Token yieldTokens
  const { requiredTokens, curveConvex2TokenYieldTokens } =
    getRequiredTokensForPricing(riskyPositions, vaultRegistry);

  // Step 2: Batch fetch token prices
  const tokenPrices = await batchFetchTokenPrices(
    requiredTokens,
    curveConvex2TokenYieldTokens,
    provider,
    tradingModule,
    network
  );

  return tokenPrices;
}
