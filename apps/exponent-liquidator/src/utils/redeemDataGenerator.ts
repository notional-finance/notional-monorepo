import { ethers } from 'ethers';
import { Network } from '@notional-finance/util';
import { VaultConfig, VaultType, EnrichedPosition, TokenPrice, PendleApiResponse } from '../types';
import { PENDLE_API_URL, NETWORK_IDS, LIMIT_ORDER_TYPE, TRADE_TYPE } from '../constants';

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

export async function generateRedeemData(
  vaultConfig: VaultConfig,
  isWithdrawRequestPending: boolean,
  yieldTokenAmount?: ethers.BigNumber,
  primaryWithdrawTokenAmount?: ethers.BigNumber,
  secondaryWithdrawTokenAmount?: ethers.BigNumber,
  tokenPrices: Map<string, TokenPrice>,
  network: Network
): Promise<string> {
  const { vaultType } = vaultConfig;

  switch (vaultType) {
    case VaultType.Staking:
      return generateStakingRedeemData(
        vaultConfig,
        isWithdrawRequestPending,
        yieldTokenAmount,
        primaryWithdrawTokenAmount,
        tokenPrices
      );
    
    case VaultType.PendlePT:
      return await generatePendlePTRedeemData(
        vaultConfig,
        isWithdrawRequestPending,
        yieldTokenAmount,
        primaryWithdrawTokenAmount,
        tokenPrices,
        network
      );
    
    case VaultType.CurveConvex2Token:
      return generateCurveConvex2TokenRedeemData(
        vaultConfig,
        isWithdrawRequestPending,
        yieldTokenAmount,
        primaryWithdrawTokenAmount,
        secondaryWithdrawTokenAmount,
        tokenPrices
      );
    
    default:
      throw new Error(`Unsupported vault type for withdraw requests: ${vaultType}`);
  }
}

export function generateStakingRedeemData(
  vaultConfig: VaultConfig,
  isWithdrawRequestPending: boolean,
  yieldTokenAmount: ethers.BigNumber | undefined,
  primaryWithdrawTokenAmount: ethers.BigNumber | undefined,
  tokenPrices: Map<string, TokenPrice>
): string {
  // Get dexId from vault config
  const dexId = vaultConfig.dexId;
  if (dexId === undefined) {
    throw new Error(`DexId not found for vault: ${vaultConfig.address}`);
  }
  
  // Get exchangeData based on withdraw request status
  const exchangeData = isWithdrawRequestPending 
    ? vaultConfig.withdrawExchangeData 
    : vaultConfig.redeemExchangeData;
  
  if (!exchangeData) {
    throw new Error(`Exchange data not found for vault: ${vaultConfig.address}, isWithdrawRequest: ${isWithdrawRequestPending}`);
  }
  
  // Calculate minPurchaseAmount
  let minPurchaseAmount: ethers.BigNumber;
  
  if (!isWithdrawRequestPending) {
    if (!yieldTokenAmount) {
      throw new Error(`Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      yieldTokenAmount,
      tokenPrices
    );
  } else {
    if (!primaryWithdrawTokenAmount) {
      throw new Error(`Primary withdraw token amount not found for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      primaryWithdrawTokenAmount,
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

export async function generatePendlePTRedeemData(
  vaultConfig: VaultConfig,
  isWithdrawRequestPending: boolean,
  yieldTokenAmount: ethers.BigNumber | undefined,
  primaryWithdrawTokenAmount: ethers.BigNumber | undefined,
  tokenPrices: Map<string, TokenPrice>,
  network: Network
): Promise<string> {
  const dexId = vaultConfig.dexId;
  
  // Calculate minPurchaseAmount using the same logic as Staking
  let minPurchaseAmount: ethers.BigNumber;
  let exchangeData: string;
  let limitOrderData: string = '0x';
  
  if (!isWithdrawRequestPending) {
    if (!yieldTokenAmount) {
      throw new Error(`Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`);
    }
    
    // Get exchangeData from redeemExchangeData
    exchangeData = vaultConfig.redeemExchangeData || '0x';
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0.01,
      yieldTokenAmount,
      tokenPrices
    );
    
    // Fetch limit order data from Pendle API
    if (vaultConfig.marketAddress && vaultConfig.ptAddress) {
      limitOrderData = await fetchPendleLimitOrderData(
        network,
        vaultConfig.marketAddress,
        vaultConfig.ptAddress,
        vaultConfig.yieldToken, // tokenOutSy
        vaultConfig.address, // vault address as receiver
        yieldTokenAmount,
        vaultConfig.ptSlippageLimit || 0.001
      );
    }

    // Encode PendleRedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes limitOrderData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint256', 'bytes', 'bytes'],
      [dexId, minPurchaseAmount, exchangeData, limitOrderData]
    );
    
    return redeemParams;
    
  } else {
    // Get exchangeData from withdrawExchangeData
    exchangeData = vaultConfig.withdrawExchangeData || '0x';
    
    if (!primaryWithdrawTokenAmount) {
      throw new Error(`Primary withdraw token amount not found for vault: ${vaultConfig.address}`);
    }
    
    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      primaryWithdrawTokenAmount,
      tokenPrices
    );
    
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint8', 'uint256', 'bytes'],
      [dexId, minPurchaseAmount, exchangeData]
    );
    
    return redeemParams;
  }
}

/**
 * Fetch limit order data from Pendle API
 */
async function fetchPendleLimitOrderData(
  network: Network,
  marketAddress: string,
  ptAddress: string,
  tokenOutSy: string,
  receiver: string,
  amountIn: ethers.BigNumber,
  slippage: number
): Promise<string> {
  try {
    const networkId = NETWORK_IDS[network];
    if (!networkId) {
      console.warn(`Network ${network} not supported by Pendle API`);
      return '0x';
    }
    
    const apiUrl = `${PENDLE_API_URL}/${networkId}/markets/${marketAddress}/swap?receiver=${receiver}&slippage=${slippage}&enableAggregator=false&tokenIn=${ptAddress}&tokenOut=${tokenOutSy}&amountIn=${amountIn.toString()}`;
    
    console.log(`Fetching Pendle limit order data from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn(`Pendle API request failed: ${response.status} ${response.statusText}`);
      return '0x';
    }
    
    const data: PendleApiResponse = await response.json();
    
    // Check if there are any fills to encode
    const limitOrderParams = data.contractCallParams[5];
    if (
      limitOrderParams.normalFills.length > 0 ||
      limitOrderParams.flashFills.length > 0
    ) {
      // Encode the limit order data if there are normal or flash fills
      return ethers.utils.defaultAbiCoder.encode(
        [LIMIT_ORDER_TYPE],
        [limitOrderParams]
      );
    }
    
    return '0x';
    
  } catch (error) {
    console.error('Error fetching Pendle limit order data:', error);
    return '0x';
  }
}

export function generateCurveConvex2TokenRedeemData(
  vaultConfig: VaultConfig,
  isWithdrawRequestPending: boolean,
  yieldTokenAmount: ethers.BigNumber | undefined,
  primaryWithdrawTokenAmount: ethers.BigNumber | undefined,
  secondaryWithdrawTokenAmount: ethers.BigNumber | undefined,
  tokenPrices: Map<string, TokenPrice>
): string {

  if (!isWithdrawRequestPending) {
    if (!yieldTokenAmount) {
      throw new Error(`Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`);
    }
    
    // For direct liquidation: empty redemptionTrades array
    if (vaultConfig.primaryIndex === undefined) {
      throw new Error(`Primary index not found for vault: ${vaultConfig.address}`);
    }
    
    const minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      yieldTokenAmount,
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
    // For withdraw requests: leave minAmounts empty, use redemptionTrades
    const minAmounts: ethers.BigNumber[] = [];
    const redemptionTrades: any[] = [];
    
    // Handle primaryWithdrawToken
    if (vaultConfig.primaryWithdrawToken === vaultConfig.asset) {
      // If primaryWithdrawToken == asset, add empty trade params
      redemptionTrades.push({
        tradeAmount: ethers.BigNumber.from(0),
        dexId: 0,
        tradeType: 0,
        minPurchaseAmount: ethers.BigNumber.from(0),
        exchangeData: '0x'
      });
    } else {
      // Construct actual trade params for primaryWithdrawToken
      if (!primaryWithdrawTokenAmount) {
        throw new Error(`Primary withdraw token amount not found for vault: ${vaultConfig.address}`);
      }
      
      const primaryMinPurchaseAmount = calculateMinPurchaseAmount(
        vaultConfig.primaryWithdrawToken,
        vaultConfig.asset,
        vaultConfig.slippageLimit || 0,
        primaryWithdrawTokenAmount,
        tokenPrices
      );
      
      redemptionTrades.push({
        tradeAmount: primaryWithdrawTokenAmount,
        dexId: vaultConfig.primaryWithdrawDexId || 0,
        tradeType: TRADE_TYPE.EXACT_IN_SINGLE,
        minPurchaseAmount: primaryMinPurchaseAmount,
        exchangeData: vaultConfig.primaryWithdrawExchangeData || '0x'
      });
    }
    
    // Handle secondaryWithdrawToken
    if (vaultConfig.secondaryWithdrawToken === vaultConfig.asset) {
      // If secondaryWithdrawToken == asset, add empty trade params
      redemptionTrades.push({
        tradeAmount: ethers.BigNumber.from(0),
        dexId: 0,
        tradeType: 0,
        minPurchaseAmount: ethers.BigNumber.from(0),
        exchangeData: '0x'
      });
    } else {
      // Construct actual trade params for secondaryWithdrawToken
      if (!secondaryWithdrawTokenAmount) {
        throw new Error(`Secondary withdraw token amount not found for vault: ${vaultConfig.address}`);
      }
      
      const secondaryMinPurchaseAmount = calculateMinPurchaseAmount(
        vaultConfig.secondaryWithdrawToken!,
        vaultConfig.asset,
        vaultConfig.slippageLimit || 0,
        secondaryWithdrawTokenAmount,
        tokenPrices
      );
      
      redemptionTrades.push({
        tradeAmount: secondaryWithdrawTokenAmount,
        dexId: vaultConfig.secondaryWithdrawDexId || 0,
        tradeType: TRADE_TYPE.EXACT_IN_SINGLE,
        minPurchaseAmount: secondaryMinPurchaseAmount,
        exchangeData: vaultConfig.secondaryWithdrawExchangeData || '0x'
      });
    }
    
    // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
    // TradeParams struct: (uint256 tradeAmount, uint16 dexId, uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[]'],
      [minAmounts, redemptionTrades]
    );
    
    return redeemParams;
  }
}