import { ethers } from 'ethers';
import { VaultConfig, VaultType, EnrichedPosition, TokenPrice } from '../types';

/**
 * Calculate minPurchaseAmount based on token prices and slippage
 */
function calculateMinPurchaseAmount(
  sellToken: string,
  buyToken: string,
  slippageLimit: number,
  sellTokenAmount: ethers.BigNumber,
  tokenPrices: Map<string, TokenPrice>
): ethers.BigNumber {
  // Get required token prices and decimals
  const sellTokenPrice = tokenPrices.get(sellToken);
  const buyTokenPrice = tokenPrices.get(buyToken);
  
  if (!sellTokenPrice || !buyTokenPrice) {
    throw new Error(`Token prices not found for sellToken: ${sellToken} or buyToken: ${buyToken}`);
  }
  
  // pairPrice = sellTokenPrice * buyTokenPrice / 1e18
  const pairPrice = sellTokenPrice.price.mul(buyTokenPrice.price).div(ethers.utils.parseUnits('1', 18));
  
  // buyTokenAmountSellTokenPrecision = sellTokenAmount * pairPrice / 1e18
  const buyTokenAmountSellTokenPrecision = sellTokenAmount.mul(pairPrice).div(ethers.utils.parseUnits('1', 18));
  
  // buyTokenAmountNativePrecision = buyTokenAmountSellTokenPrecision * 1e(buyTokenDecimals) / 1e(sellTokenDecimals)
  const buyTokenAmountNativePrecision = buyTokenAmountSellTokenPrecision
    .mul(ethers.utils.parseUnits('1', buyTokenPrice.decimals))
    .div(ethers.utils.parseUnits('1', sellTokenPrice.decimals));
  
  // minPurchaseAmount = buyTokenAmountNativePrecision * (1 - slippageLimit)
  const slippageMultiplier = ethers.utils.parseUnits('1', 18).sub(
    ethers.utils.parseUnits(slippageLimit.toString(), 18)
  );
  const minPurchaseAmount = buyTokenAmountNativePrecision.mul(slippageMultiplier).div(ethers.utils.parseUnits('1', 18));
  
  return minPurchaseAmount;
}

export function generateRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
  const { vaultType } = vaultConfig;

  switch (vaultType) {
    case VaultType.Staking:
      return generateStakingRedeemData(vaultConfig, position, tokenPrices);
    
    case VaultType.PendlePT:
      return generatePendlePTRedeemData(vaultConfig, position, tokenPrices);
    
    case VaultType.CurveConvex2Token:
      return generateCurveConvex2TokenRedeemData(vaultConfig, position, tokenPrices);
    
    default:
      throw new Error(`Unsupported vault type for withdraw requests: ${vaultType}`);
  }
}

export function generateStakingRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
  // Get dexId from vault config
  const dexId = vaultConfig.dexId;
  if (dexId === undefined) {
    throw new Error(`DexId not found for vault: ${vaultConfig.address}`);
  }
  
  // Get exchangeData based on withdraw request status
  const exchangeData = position.isWithdrawRequestPending 
    ? vaultConfig.withdrawExchangeData 
    : vaultConfig.redeemExchangeData;
  
  if (!exchangeData) {
    throw new Error(`Exchange data not found for vault: ${vaultConfig.address}, isWithdrawRequest: ${position.isWithdrawRequestPending}`);
  }
  
  // Calculate minPurchaseAmount
  let minPurchaseAmount: ethers.BigNumber;
  
  if (!position.isWithdrawRequestPending) {
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      position.totalYieldTokens,
      tokenPrices
    );
  } else {
    if (!position.primaryWithdrawTokenAmount) {
      throw new Error(`Primary withdraw token amount not found for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      position.primaryWithdrawTokenAmount,
      tokenPrices
    );
  }
  
  // Encode RedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)
  const redeemParams = ethers.utils.defaultAbiCoder.encode(
    ['uint8', 'uint256', 'bytes'],
    [dexId, minPurchaseAmount, exchangeData]
  );
  
  return redeemParams;
}

export function generatePendlePTRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
  // Get dexId from vault config
  const dexId = vaultConfig.dexId;
  if (dexId === undefined) {
    throw new Error(`DexId not found for vault: ${vaultConfig.address}`);
  }
  
  // Calculate minPurchaseAmount using the same logic as Staking
  let minPurchaseAmount: ethers.BigNumber;
  
  if (!position.isWithdrawRequestPending) {
    // Get exchangeData from redeemExchangeData
    const exchangeData = vaultConfig.redeemExchangeData;
    if (!exchangeData) {
      throw new Error(`Redeem exchange data not found for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      position.totalYieldTokens,
      tokenPrices
    );
    
    // Encode PendleRedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes limitOrderData)
    const limitOrderData = '0x'; // Always empty bytes
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint256', 'bytes', 'bytes'],
      [dexId, minPurchaseAmount, exchangeData, limitOrderData]
    );
    
    return redeemParams;
    
  } else {
    // Get exchangeData from withdrawExchangeData
    const exchangeData = vaultConfig.withdrawExchangeData;
    if (!exchangeData) {
      throw new Error(`Withdraw exchange data not found for vault: ${vaultConfig.address}`);
    }
    
    if (!position.primaryWithdrawTokenAmount) {
      throw new Error(`Primary withdraw token amount not found for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      position.primaryWithdrawTokenAmount,
      tokenPrices
    );
    
    // Encode RedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint256', 'bytes'],
      [dexId, minPurchaseAmount, exchangeData]
    );
    
    return redeemParams;
  }
}

export function generateCurveConvex2TokenRedeemData(vaultConfig: VaultConfig, position: EnrichedPosition, tokenPrices: Map<string, TokenPrice>): string {
  // TradeType enum values
  const TradeType = {
    EXACT_IN_SINGLE: 1,
    EXACT_OUT_SINGLE: 2,
    EXACT_IN_BATCH: 4,
    EXACT_OUT_BATCH: 8
  };

  if (!position.isWithdrawRequestPending) {
    // For direct liquidation: empty redemptionTrades array
    if (vaultConfig.primaryIndex === undefined) {
      throw new Error(`Primary index not found for vault: ${vaultConfig.address}`);
    }
    
    const minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      position.totalYieldTokens,
      tokenPrices
    );
    
    // Initialize minAmounts array with zeros for both tokens
    const minAmounts: ethers.BigNumber[] = [ethers.BigNumber.from(0), ethers.BigNumber.from(0)];
    // Set minAmounts[primaryIndex] equal to minPurchaseAmount
    minAmounts[vaultConfig.primaryIndex] = minPurchaseAmount;
    
    const redemptionTrades: any[] = []; // Empty array as specified
    
    // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[]'],
      [minAmounts, redemptionTrades]
    );
    
    return redeemParams;
    
  } else {
    // For withdraw requests: need to implement redemptionTrades logic
    const minAmounts: ethers.BigNumber[] = []; // TODO: Calculate minAmounts
    const redemptionTrades: any[] = []; // TODO: Implement redemptionTrades logic
    
    // TradeParams struct: (uint256 tradeAmount, uint16 dexId, uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData)
    // TODO: Populate redemptionTrades based on withdraw request logic
    
    // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[]'],
      [minAmounts, redemptionTrades]
    );
    
    return redeemParams;
  }
}