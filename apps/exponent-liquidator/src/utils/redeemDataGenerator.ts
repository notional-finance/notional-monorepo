import { BytesLike, ethers } from 'ethers';
import { Network } from '@notional-finance/util';
import { VaultConfig, VaultType, TokenPrice, ConvertResponse } from '../types';
import {
  PENDLE_API_URL,
  NETWORK_IDS,
  LIMIT_ORDER_TYPE,
  TRADE_TYPE,
} from '../constants';
import { logError } from './logger';

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
    throw new Error(
      `Token prices not found for sellToken: ${sellToken} or buyToken: ${buyToken}`
    );
  }

  // pairPrice = sellTokenPrice * buyTokenPrice / 1e18
  const pairPrice = sellTokenPrice.price
    .mul(ethers.utils.parseUnits('1', 18))
    .div(buyTokenPrice.price);

  // buyTokenAmountSellTokenPrecision = sellTokenAmount * pairPrice / 1e18
  const buyTokenAmountSellTokenPrecision = sellTokenAmount
    .mul(pairPrice)
    .div(ethers.utils.parseUnits('1', 18));

  // buyTokenAmountNativePrecision = buyTokenAmountSellTokenPrecision * 1e(buyTokenDecimals) / 1e(sellTokenDecimals)
  const buyTokenAmountNativePrecision = buyTokenAmountSellTokenPrecision
    .mul(ethers.utils.parseUnits('1', buyTokenPrice.decimals))
    .div(ethers.utils.parseUnits('1', sellTokenPrice.decimals));

  // minPurchaseAmount = buyTokenAmountNativePrecision * (1 - slippageLimit)
  const slippageMultiplier = ethers.utils
    .parseUnits('1', 18)
    .sub(ethers.utils.parseUnits(slippageLimit.toString(), 18));

  const minPurchaseAmount = buyTokenAmountNativePrecision
    .mul(slippageMultiplier)
    .div(ethers.utils.parseUnits('1', 18));

  return minPurchaseAmount;
}

export async function generateRedeemData(
  vaultConfig: VaultConfig,
  isWithdrawRequestPending: boolean,
  tokenPrices: Map<string, TokenPrice>,
  network: Network,
  yieldTokenAmount?: ethers.BigNumber,
  primaryWithdrawTokenAmount?: ethers.BigNumber,
  secondaryWithdrawTokenAmount?: ethers.BigNumber
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
      throw new Error(
        `Unsupported vault type for withdraw requests: ${vaultType}`
      );
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

  // Calculate minPurchaseAmount
  let minPurchaseAmount: ethers.BigNumber;

  if (!isWithdrawRequestPending) {
    if (!yieldTokenAmount) {
      throw new Error(
        `Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`
      );
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
      throw new Error(
        `Primary withdraw token amount not found for vault: ${vaultConfig.address}`
      );
    }

    if (vaultConfig.primaryWithdrawToken === vaultConfig.asset) {
      return '0x';
    }

    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      primaryWithdrawTokenAmount,
      tokenPrices
    );
  }

  // Get exchangeData based on withdraw request status
  const exchangeData = isWithdrawRequestPending
    ? vaultConfig.withdrawExchangeData
    : vaultConfig.redeemExchangeData;

  if (!exchangeData) {
    throw new Error(
      `Exchange data not found for vault: ${vaultConfig.address}, isWithdrawRequest: ${isWithdrawRequestPending}`
    );
  }

  // Encode RedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)
  const redeemParams = ethers.utils.defaultAbiCoder.encode(
    ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)'],
    [{ dexId, minPurchaseAmount, exchangeData }]
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
  let limitOrderData = '0x';

  if (!isWithdrawRequestPending) {
    if (!yieldTokenAmount) {
      throw new Error(
        `Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`
      );
    }

    // Fetch limit order data from Pendle API
    if (vaultConfig.marketAddress && vaultConfig.ptAddress) {
      limitOrderData = await fetchPendleLimitOrderData(
        network,
        vaultConfig.ptAddress,
        vaultConfig.tokenOutSy || '', // tokenOutSy
        vaultConfig.address, // vault address as receiver
        yieldTokenAmount,
        vaultConfig.ptSlippageLimit || 0.001
      );
    }

    if (vaultConfig.tokenOutSy === vaultConfig.asset) {
      exchangeData = '0x';
      minPurchaseAmount = ethers.BigNumber.from(0);
    } else {
      // Get exchangeData from redeemExchangeData
      exchangeData = vaultConfig.redeemExchangeData || '0x';

      minPurchaseAmount = calculateMinPurchaseAmount(
        vaultConfig.yieldToken,
        vaultConfig.asset,
        vaultConfig.slippageLimit || 0.01,
        yieldTokenAmount,
        tokenPrices
      );
    }

    // Encode PendleRedeemParams struct: (uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes limitOrderData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      [
        'tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData, bytes limitOrderData)',
      ],
      [{ dexId, minPurchaseAmount, exchangeData, limitOrderData }]
    );

    return redeemParams;
  } else {
    if (vaultConfig.primaryWithdrawToken === vaultConfig.asset) {
      return '0x';
    }

    // Get exchangeData from withdrawExchangeData
    exchangeData = vaultConfig.withdrawExchangeData || '0x';

    if (!primaryWithdrawTokenAmount) {
      throw new Error(
        `Primary withdraw token amount not found for vault: ${vaultConfig.address}`
      );
    }

    minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.primaryWithdrawToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      primaryWithdrawTokenAmount,
      tokenPrices
    );

    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['tuple(uint8 dexId, uint256 minPurchaseAmount, bytes exchangeData)'],
      [{ dexId, minPurchaseAmount, exchangeData }]
    );

    return redeemParams;
  }
}

/**
 * Fetch limit order data from Pendle API
 */
async function fetchPendleLimitOrderData(
  network: Network,
  ptAddress: string,
  tokenOutSy: string,
  receiver: string,
  amountIn: ethers.BigNumber,
  slippage: number
): Promise<string> {
  try {
    const networkId = NETWORK_IDS[network];
    if (!networkId) {
      return '0x';
    }

    const apiUrl = `${PENDLE_API_URL}/${networkId}/convert?receiver=${receiver}&slippage=${slippage}&enableAggregator=false&tokensIn=${ptAddress}&tokensOut=${tokenOutSy}&amountsIn=${amountIn.toString()}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      return '0x';
    }

    let pendleData: BytesLike = '0x';

    const data: ConvertResponse = await response.json();
    if (
      data.routes[0].contractParamInfo.contractCallParams[4].normalFills
        .length > 0 ||
      data.routes[0].contractParamInfo.contractCallParams[4].flashFills.length >
        0
    ) {
      // Only encode the limit order data if there are normal or flash fills
      pendleData = ethers.utils.defaultAbiCoder.encode(
        [LIMIT_ORDER_TYPE],
        [data.routes[0].contractParamInfo.contractCallParams[4]]
      );
    }

    return pendleData;
  } catch (error) {
    logError('Error fetching Pendle limit order data', error as Error, {
      network,
      ptAddress,
      tokenOutSy,
      receiver,
      amountIn,
      slippage,
    });
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
      throw new Error(
        `Yield token amount is required when not withdrawing for vault: ${vaultConfig.address}`
      );
    }

    // For direct liquidation: empty redemptionTrades array
    if (vaultConfig.primaryIndex === undefined) {
      throw new Error(
        `Primary index not found for vault: ${vaultConfig.address}`
      );
    }

    const minPurchaseAmount = calculateMinPurchaseAmount(
      vaultConfig.yieldToken,
      vaultConfig.asset,
      vaultConfig.slippageLimit || 0,
      yieldTokenAmount,
      tokenPrices
    );

    // Initialize minAmounts array with zeros for both tokens
    const minAmounts: ethers.BigNumber[] = [
      ethers.BigNumber.from(0),
      ethers.BigNumber.from(0),
    ];
    // Set minAmounts[primaryIndex] equal to minPurchaseAmount
    minAmounts[vaultConfig.primaryIndex] = minPurchaseAmount;

    const redemptionTrades: any[] = []; // Empty array as specified

    // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      [
        'tuple(uint256[] minAmounts, tuple(uint256,uint16,uint8,uint256,bytes)[] redemptionTrades)',
      ],
      [{ minAmounts, redemptionTrades }]
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
        exchangeData: '0x',
      });
    } else {
      // Construct actual trade params for primaryWithdrawToken
      if (!primaryWithdrawTokenAmount) {
        throw new Error(
          `Primary withdraw token amount not found for vault: ${vaultConfig.address}`
        );
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
        exchangeData: vaultConfig.primaryWithdrawExchangeData || '0x',
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
        exchangeData: '0x',
      });
    } else {
      // Construct actual trade params for secondaryWithdrawToken
      if (!secondaryWithdrawTokenAmount) {
        throw new Error(
          `Secondary withdraw token amount not found for vault: ${vaultConfig.address}`
        );
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
        exchangeData: vaultConfig.secondaryWithdrawExchangeData || '0x',
      });
    }

    // Encode RedeemParams struct: (uint256[] minAmounts, TradeParams[] redemptionTrades)
    // TradeParams struct: (uint256 tradeAmount, uint16 dexId, uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData)
    const redeemParams = ethers.utils.defaultAbiCoder.encode(
      ['tuple(uint256[]', 'tuple(uint256,uint16,uint8,uint256,bytes)[])'],
      [{ minAmounts, redemptionTrades }]
    );

    return redeemParams;
  }
}
