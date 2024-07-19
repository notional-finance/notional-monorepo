import { Network, NetworkId } from './constants';
import { BigNumber } from 'ethers';

interface Env {
  NETWORK: Network;
  ZERO_EX_API_KEY: string;
}

const DEFAULT_SLIPPAGE_PERCENT = 5;
const zeroXDelay = 4000; // in ms
const s = { lastGet0xDataCall: 0 };

const wait = (ms: number) => new Promise((f) => setTimeout(f, ms));

export async function get0xData(arg: {
  sellToken: string;
  buyToken: string;
  sellAmount: BigNumber;
  slippagePercentage?: number;
  env: Env;
}) {
  const {
    sellToken,
    buyToken,
    sellAmount,
    env,
    slippagePercentage = DEFAULT_SLIPPAGE_PERCENT,
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
    chainId: String(NetworkId[env.NETWORK]),
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: sellAmount.toString(),
    slippagePercentage: String(slippagePercentage / 100),
    // this field is required by 0x api but it's value is not important for our implementation
    taker: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
  }).toString();

  const response = await fetch(
    `https://api.0x.org/swap/allowance-holder/quote?${searchParams}`,
    {
      headers: {
        '0x-api-key': env.ZERO_EX_API_KEY,
      },
    }
  );

  const data = await response.json();
  if (data['buyAmount'] == undefined) {
    throw Error('Failed call to 0x api');
  }

  s.lastGet0xDataCall = Date.now();

  const buyAmount = BigNumber.from(data['buyAmount']);
  return {
    buyAmount,
    limit: buyAmount.mul(100 - slippagePercentage).div(100),
    data: data['transaction']['data'] as string,
  };
}
