import { Network, NetworkId } from './constants';
import { BigNumber } from 'ethers';

const ZERO_EX_API_KEY = process.env.ZERO_EX_API_KEY;
const DEFAULT_SLIPPAGE_BPS = 10;
const zeroXDelay = 100; // in ms
const s = { lastGet0xDataCall: 0 };

const wait = (ms: number) => new Promise((f) => setTimeout(f, ms));

export const zeroExUrl = 'https://api.0x.org/swap/allowance-holder/quote';

export async function get0xData(arg: {
  network: Network;
  sellToken: string;
  buyToken: string;
  sellAmount: BigNumber;
  slippageBPS?: number;
  taker: string;
  sellEntireBalance?: boolean;
}) {
  const {
    sellToken,
    buyToken,
    sellAmount,
    taker,
    slippageBPS = DEFAULT_SLIPPAGE_BPS,
    network,
    sellEntireBalance = false,
  } = arg;
  if (sellAmount.isZero()) {
    return {
      buyAmount: BigNumber.from(0),
      limit: BigNumber.from(0),
      data: '',
    };
  }
  // ensure we don't hit rate limit on 0x API
  const timeToNextCall = s.lastGet0xDataCall + zeroXDelay - Date.now();
  if (timeToNextCall > 0) {
    await wait(timeToNextCall);
  }

  const searchParams = new URLSearchParams({
    chainId: String(NetworkId[network]),
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: sellAmount.toString(),
    slippageBPS: slippageBPS.toString(),
    sellEntireBalance: sellEntireBalance ? 'true' : 'false',
    taker,
  }).toString();

  const response = await fetch(`${zeroExUrl}?${searchParams}`, {
    headers: {
      '0x-api-key': ZERO_EX_API_KEY || '',
      '0x-version': 'v2',
    },
  });

  const data = (await response.json()) as {
    buyAmount: string;
    limit: string;
    transaction: {
      data: string;
    };
  };
  if (data['buyAmount'] == undefined) {
    throw Error('Failed call to 0x api');
  }

  s.lastGet0xDataCall = Date.now();

  const buyAmount = BigNumber.from(data['buyAmount']);
  return {
    buyAmount,
    limit: BigNumber.from(data['minBuyAmount']),
    data: data['transaction']['data'] as string,
  };
}
