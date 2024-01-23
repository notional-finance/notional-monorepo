import { BigNumber } from "ethers";

interface Env {
  ZERO_EX_API_KEY: string,
  ZERO_EX_API_URL: string,
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
      limit: 0,
      data: ''
    };
  }
  // ensure we don't hit ratelimit on 0x API
  const timeToNextCall = s.lastGet0xDataCall + zeroXDelay - Date.now();
  if (timeToNextCall > 0) {
    await wait(timeToNextCall);
  }

  const searchParams = new URLSearchParams({
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: sellAmount.toString(),
    slippagePercentage: String(slippagePercentage / 100)
  })

  const data = await fetch(`${env.ZERO_EX_API_URL}?${searchParams}`, {
    headers: {
      "0x-api-key": env.ZERO_EX_API_KEY
    },
  }).then(r => r.json());

  const buyAmount = BigNumber.from(data["buyAmount"]);
  return {
    buyAmount,
    limit: buyAmount.mul(100 - slippagePercentage).div(100),
    data: data["data"] as string
  };
}
