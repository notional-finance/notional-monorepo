import { BigNumber } from 'ethers';
import { Network, NetworkId, RATE_PRECISION } from '.';
import { BytesLike, defaultAbiCoder } from 'ethers/lib/utils';

interface OrderType {
  salt: string;
  expiry: string;
  nonce: string;
  orderType: string;
  token: string;
  YT: string;
  maker: string;
  receiver: string;
  makingAmount: string;
  lnImpliedRate: string;
  failSafeRate: string;
  permit: string;
}

interface ConvertResponseBuyPT {
  routes: {
    contractParamInfo: {
      contractCallParams: [
        string,
        string,
        string,
        {
          eps: string;
          guessMax: string;
          guessMin: string;
          guessOffchain: string;
          maxIteration: string;
        }, // approxParams
        object, // swapData
        {
          epsSkipMarket: string;
          flashFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          normalFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          optData: string;
          limitRouter: string;
        } // limitOrderData
      ];
    };
    data: {
      priceImpact: number;
    };
    outputs: {
      amount: string;
      token: string;
    }[];
  }[];
}

interface ConvertResponseSellPT {
  routes: {
    contractParamInfo: {
      contractCallParams: [
        string, // receiver
        string, // market
        string, // exactPTIn
        object, // output (token info)
        {
          epsSkipMarket: string;
          flashFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          normalFills: {
            order: OrderType;
            signature: string;
            makingAmount: string;
          }[];
          optData: string;
          limitRouter: string;
        } // limitOrderData
      ];
    };
    data: {
      priceImpact: number;
    };
    outputs: {
      amount: string;
      token: string;
    }[];
  }[];
}

const APPROX_PARAMS_TYPE =
  'tuple(uint256 guessMin, uint256 guessMax, uint256 guessOffchain, uint256 maxIteration, uint256 eps)';
const ORDER_TYPE =
  'tuple(uint256 salt, uint256 expiry, uint256 nonce, uint8 orderType, address token, address YT, address maker, address receiver, uint256 makingAmount, uint256 lnImpliedRate, uint256 failSafeRate, bytes permit)';
const FILL_ORDER_PARAMS_TYPE = `tuple(${ORDER_TYPE} order, bytes signature, uint256 makingAmount)`;
const LIMIT_ORDER_TYPE = `tuple(address limitRouter, uint256 epsSkipMarket, ${FILL_ORDER_PARAMS_TYPE}[] normalFills, ${FILL_ORDER_PARAMS_TYPE}[] flashFills, bytes optData)`;
const PENDLE_DATA_TYPE = `tuple(uint256 minPtOut, ${APPROX_PARAMS_TYPE} approxParams, ${LIMIT_ORDER_TYPE} limitOrderData)`;

const API_URL = 'https://api-v2.pendle.finance/core/v2/sdk';

async function fetchBuyPTData(
  network: Network,
  vaultAddress: string,
  tokenInSy: string,
  ptTokenAddress: string,
  minSYPurchaseAmount: BigNumber,
  slippageFactor: number
) {
  const searchParams = new URLSearchParams({
    receiver: vaultAddress,
    slippage: (slippageFactor / RATE_PRECISION).toString(),
    enableAggregator: 'false',
    tokensIn: tokenInSy,
    tokensOut: ptTokenAddress,
    amountsIn: minSYPurchaseAmount.toString(),
  }).toString();

  const response = await fetch(
    `${API_URL}/${NetworkId[network]}/convert?${searchParams}`
  );
  const data: ConvertResponseBuyPT = await response.json();
  const minPtOut = BigNumber.from(
    data.routes[0].contractParamInfo.contractCallParams[2] as string
  );
  const approxParams = data.routes[0].contractParamInfo.contractCallParams[3];
  const limitOrderData = data.routes[0].contractParamInfo.contractCallParams[5];

  return {
    minPtOut,
    approxParams,
    limitOrderData,
  };
}

async function fetchSellPTData(
  network: Network,
  vaultAddress: string,
  ptTokenAddress: string,
  tokenOutSy: string,
  minPTToSellAmount: BigNumber,
  slippageFactor: number
) {
  const searchParams = new URLSearchParams({
    receiver: vaultAddress,
    slippage: (slippageFactor / RATE_PRECISION).toString(),
    enableAggregator: 'false',
    tokensIn: ptTokenAddress,
    tokensOut: tokenOutSy,
    amountsIn: minPTToSellAmount.toString(),
  }).toString();

  const response = await fetch(
    `${API_URL}/${NetworkId[network]}/convert?${searchParams}`
  );
  const data: ConvertResponseSellPT = await response.json();

  let pendleData: BytesLike = '0x';
  if (
    data.routes[0].contractParamInfo.contractCallParams[4].normalFills.length >
      0 ||
    data.routes[0].contractParamInfo.contractCallParams[4].flashFills.length > 0
  ) {
    // Only encode the limit order data if there are normal or flash fills
    pendleData = defaultAbiCoder.encode(
      [LIMIT_ORDER_TYPE],
      [data.routes[0].contractParamInfo.contractCallParams[4]]
    );
  }

  const minSyOut = BigNumber.from(data.routes[0].outputs[0].amount)
    .mul(RATE_PRECISION - slippageFactor)
    .div(RATE_PRECISION);
  return {
    minSyOut,
    pendleData,
  };
}
