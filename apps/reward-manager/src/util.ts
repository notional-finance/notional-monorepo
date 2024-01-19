import { BigNumber } from "ethers";
import { Env } from "./types";

const DEFAULT_SLIPPAGE_PERCENT = 5;
const zeroXDelay = 4000; // in ms
const s = { lastGet0xDataCall: 0 };

const wait = (ms: number) => new Promise(f => setTimeout(f, ms));

export function sendTxThroughRelayer(arg: { env: Env, to: string, data: string }) {
  const { to, data, env } = arg;

  const payload = JSON.stringify({
    to,
    data,
  });
  console.log("sending tx to relayer");
  // cspell:disable-next-line
  return fetch(env.TX_RELAY_SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
}

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
  console.debug("calling 0x api...");
  const data = await fetch(`${env.ZERO_EX_API_URL}?${searchParams}`, {
    headers: {
      "0x-api-key": env.ZERO_EX_API_KEY
    },
  }).then(r => r.json());
  console.debug("Success");

  const buyAmount = BigNumber.from(data["buyAmount"]);
  return {
    buyAmount,
    limit: buyAmount.mul(100 - slippagePercentage).div(100),
    data: data["data"] as string
  };
}
