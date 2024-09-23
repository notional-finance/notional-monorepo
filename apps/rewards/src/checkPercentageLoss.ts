import { Network } from '@notional-finance/util';
import { Env } from './types';
import { BigNumber } from 'ethers';

const DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS = 3;
const acceptablePercentageLoss = {
  [Network.mainnet]: {},
  [Network.arbitrum]: {},
};

async function getTokensPricesFromDefiLlama(
  network: string,
  tokenAddress: string[]
) {
  const coins = tokenAddress.map((token) => `${network}:${token}`);
  const url = `https://coins.llama.fi/prices/current/${coins.join(',')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error fetching token price: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    coins: { [key: string]: { price: number; decimals: number } };
  };

  const coinsData = coins.map((coin) => data.coins[coin]);
  if (coinsData.some((coinData) => !coinData)) {
    throw new Error('Failed to fetch token price from DefiLlama');
  }

  return coinsData;
}

export default async function checkPercentageLoss(
  env: Env,
  {
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
  }: {
    sellToken: string;
    buyToken: string;
    sellAmount: BigNumber;
    buyAmount: BigNumber;
  }
) {
  const [sellTokenData, buyTokenData] = await getTokensPricesFromDefiLlama(
    env.NETWORK,
    [sellToken, buyToken]
  );
  const sellAmountInUsd =
    sellTokenData.price *
    sellAmount.div(BigNumber.from(10).pow(sellTokenData.decimals)).toNumber();
  const buyAmountInUsd =
    buyTokenData.price *
    buyAmount.div(BigNumber.from(10).pow(buyTokenData.decimals)).toNumber();
  const percentageLoss =
    ((sellAmountInUsd - buyAmountInUsd) * 100) / sellAmountInUsd;

  const acceptableLoss =
    acceptablePercentageLoss[env.NETWORK][sellToken] ||
    DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS;

  if (percentageLoss > acceptableLoss) {
    return { acceptable: false, percentageLoss };
  }

  return { acceptable: true, percentageLoss };
}
