import {Network} from './constants';
import { BigNumber } from "ethers";

interface Env {
  NETWORK: keyof typeof Network;
  ZERO_EX_API_KEY: string,
}

const urls: Record<Network,string> = {
  all: '',
  mainnet: 'https://api.0x.org/swap/v1/quote',
  arbitrum: 'https://arbitrum.api.0x.org/swap/v1/quote',
}

const DEFAULT_SLIPPAGE_PERCENT = 5;
const zeroXDelay = 4000; // in ms
const s = { lastGet0xDataCall: 0 };

const wait = (ms: number) => new Promise(f => setTimeout(f, ms));

export async function get0xData(
  arg: { sellToken: string, buyToken: string, sellAmount: BigNumber, slippagePercentage?: number, env: Env }
) {
  const { sellToken, buyToken, sellAmount, env, slippagePercentage = DEFAULT_SLIPPAGE_PERCENT } = arg;
  if (sellAmount.isZero()) {
    return {
      buyAmount: BigNumber.from(0),
      limit: BigNumber.from(0),
      data: ''
    };
  }
  // ensure we don't hit rate limit on 0x API
  const timeToNextCall = s.lastGet0xDataCall + zeroXDelay - Date.now();
  if (timeToNextCall > 0) {
    await wait(timeToNextCall);
  }

  const searchParams = new URLSearchParams({
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: sellAmount.toString(),
    slippagePercentage: String(slippagePercentage / 100)
  }).toString();

  console.log(searchParams);

  const response = await fetch(`${urls[Network[env.NETWORK]]}?${searchParams}`, {
    headers: {
      "0x-api-key": env.ZERO_EX_API_KEY
    },
  });

  const data = await response.json();
  if (data["buyAmount"] == undefined) {
    throw Error("Failed call to 0x api");
  }

  s.lastGet0xDataCall = Date.now();

  const buyAmount = BigNumber.from(data["buyAmount"]);
  return {
    buyAmount,
    limit: buyAmount.mul(100 - slippagePercentage).div(100),
    data: data["data"] as string
  };
}
