import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { fetch as crossFetch } from 'cross-fetch';
import TypedBigNumber, { BigNumberType } from '../../libs/TypedBigNumber';
import { INTERNAL_TOKEN_PRECISION } from '../../config/constants';

const apiUrl = {
  mainnet: 'https://api.0x.org',
  // Goerli is not supported by zero ex so we use mainnet for estimation
  goerli: 'https://api.0x.org',
};

export type NETWORKS = keyof typeof apiUrl;
export type SOURCES =
  | '0x'
  | 'Multihop'
  | 'Balancer_V2'
  | 'Curve'
  | 'Curve_V2'
  | 'Lido'
  | 'MakerPsm'
  | 'SushiSwap'
  | 'Synthetix'
  | 'Uniswap_V2'
  | 'Uniswap_V3';

interface PriceResponse {
  buyTokenAddress: string;
  sellTokenAddress: string;
  price: string;
  estimatedPriceImpact: string;
  buyAmount: string;
  sellAmount: string;
  sources: {
    name: string;
    proportion: string;
  }[];
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
}

interface QuoteResponse {
  price: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string;
  buyAmount: string;
  sellAmount: string;
  data: string;
  sources: {
    name: string;
    proportion: string;
  }[];
}

export interface Estimate {
  price: BigNumber;
  estimatedPriceImpact: BigNumber;
  buyAmount: TypedBigNumber;
  sellAmount: TypedBigNumber;
  sources: {
    name: string;
    proportion: number;
  }[];
}

export interface EstimateResult {
  network: NETWORKS;
  buyTokenAddress: string;
  sellTokenAddress: string;
  estimates: Estimate[];
}

interface Token {
  symbol: string;
  address: string;
  decimals: number;
}

const Tokens: Record<string, Token> = {
  USDC: {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  DAI: {
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
  ETH: {
    symbol: 'ETH',
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    decimals: 18,
  },
};

const RequiredEstimates: Record<
  NETWORKS,
  {
    buyToken: Token;
    sellToken: Token;
    sellRanges: number[];
    addressOverride?: {
      buyToken: string;
      sellToken: string;
    };
  }[]
> = {
  mainnet: [
    {
      buyToken: Tokens.USDC,
      sellToken: Tokens.DAI,
      sellRanges: [100_000, 10_000_000],
    },
    {
      buyToken: Tokens.DAI,
      sellToken: Tokens.USDC,
      sellRanges: [100_000, 10_000_000],
    },
    {
      buyToken: Tokens.ETH,
      sellToken: Tokens.DAI,
      sellRanges: [100_000, 10_000_000],
    },
  ],
  goerli: [
    {
      buyToken: Tokens.USDC,
      sellToken: Tokens.DAI,
      sellRanges: [100_000, 10_000_000],
      addressOverride: {
        buyToken: '0x31dd61ac1b7a0bc88f7a58389c0660833a66c35c',
        sellToken: '0x84e90bddff9a0e124f1ab7f4d1d33a7c748c1a16',
      },
    },
    {
      buyToken: Tokens.DAI,
      sellToken: Tokens.USDC,
      sellRanges: [100_000, 10_000_000],
      addressOverride: {
        buyToken: '0x84e90bddff9a0e124f1ab7f4d1d33a7c748c1a16',
        sellToken: '0x31dd61ac1b7a0bc88f7a58389c0660833a66c35c',
      },
    },
    {
      buyToken: Tokens.ETH,
      sellToken: Tokens.DAI,
      sellRanges: [100_000, 10_000_000],
      addressOverride: {
        buyToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        sellToken: '0x84e90bddff9a0e124f1ab7f4d1d33a7c748c1a16',
      },
    },
  ],
};

const filterSource = (sources: { name: string; proportion: string }[]) =>
  sources
    .map(({ name, proportion }) => ({ name, proportion: Number(proportion) }))
    .filter(({ proportion }) => Number(proportion) > 0);

const fetchTradingEstimate = async (
  buyToken: Token,
  sellToken: Token,
  sellRanges: number[],
  network: NETWORKS,
  _fetch: any,
  addressOverride?: {
    buyToken: string;
    sellToken: string;
  }
): Promise<EstimateResult> => {
  const zeroExUrl = apiUrl[network];

  const estimates = (
    await Promise.all(
      sellRanges.map(async (a) => {
        try {
          const sellAmountString = parseUnits(a.toString(), sellToken.decimals).toString();
          const resp = await _fetch(
            `${zeroExUrl}/swap/v1/price?sellToken=${sellToken.address}&buyToken=${buyToken.address}&sellAmount=${sellAmountString}`
          );
          const v: PriceResponse = await resp.json();
          return {
            price: BigNumber.from(Math.floor(Number(v.price) * INTERNAL_TOKEN_PRECISION)),
            estimatedPriceImpact: BigNumber.from(Math.floor(Number(v.price) * INTERNAL_TOKEN_PRECISION)),
            buyAmount: TypedBigNumber.from(
              v.buyAmount,
              BigNumberType.ExternalUnderlying,
              buyToken.symbol,
              buyToken.decimals
            ),
            sellAmount: TypedBigNumber.from(
              v.sellAmount,
              BigNumberType.ExternalUnderlying,
              sellToken.symbol,
              sellToken.decimals
            ),
            sources: filterSource(v.sources),
          };
        } catch (e) {
          console.error(e);
          return undefined;
        }
      })
    )
  )
    .filter((r): r is Estimate => !!r)
    .sort((a, b) => (a.sellAmount.lt(b.sellAmount) ? -1 : 1));

  return {
    network,
    // Since not all networks are supported by zero ex, we override the token addresses on
    // testnet so that we use mainnet data
    buyTokenAddress: addressOverride ? addressOverride.buyToken.toLowerCase() : buyToken.address.toLowerCase(),
    sellTokenAddress: addressOverride ? addressOverride.sellToken.toLowerCase() : sellToken.address.toLowerCase(),
    estimates,
  };
};

export function getTradingEstimates(network: NETWORKS, skipFetchSetup: boolean) {
  const _fetch = skipFetchSetup ? fetch : crossFetch;
  return Promise.all(
    RequiredEstimates[network].map(({ buyToken, sellToken, sellRanges, addressOverride }) =>
      fetchTradingEstimate(buyToken, sellToken, sellRanges, network as NETWORKS, _fetch, addressOverride)
    )
  );
}

export async function getTrade(
  network: NETWORKS,
  sellTokenAddress: string,
  buyTokenAddress: string,
  sellAmount: BigNumber,
  skipFetchSetup: boolean
) {
  const _fetch = skipFetchSetup ? fetch : crossFetch;
  const zeroExUrl = apiUrl[network];

  const resp = await _fetch(
    `${zeroExUrl}/swap/v1/quote?sellToken=${sellTokenAddress}&buyToken=${buyTokenAddress}&sellAmount=${sellAmount.toString()}`
  );
  const v: QuoteResponse = await resp.json();

  return {
    price: Number(v.price),
    guaranteedPrice: Math.floor(Number(v.guaranteedPrice) * INTERNAL_TOKEN_PRECISION),
    buyAmount: BigNumber.from(v.buyAmount),
    sellAmount: BigNumber.from(v.sellAmount),
    data: v.data,
    sources: filterSource(v.sources),
  };
}
