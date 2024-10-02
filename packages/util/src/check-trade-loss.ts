import { Network } from './constants';
import { BigNumber } from 'ethers';

const DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS = 5;
const acceptablePercentageLoss = {
  [Network.mainnet]: {},
  [Network.arbitrum]: {},
};

async function getTokensPricesFromDefiLlama(
  network: Network,
  tokenAddress: string[]
) {
  const prefix = network === Network.mainnet ? 'ethereum' : network;
  const coins = tokenAddress.map((token) => `${prefix}:${token}`);
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

  return coinsData.map((cd) => ({
    // 1e15 is maximum number we can multiply price with without precision loss
    price: BigNumber.from((cd.price * 1e15).toFixed(0)).mul(1e3),
    decimals: cd.decimals,
  }));
}

/**
 *
 * @returns {BigNumber} USD value, BigNumber with 18 decimals
 */
const convertToUsd = (
  amount: BigNumber,
  decimals: number,
  price: BigNumber
) => {
  return amount.mul(price).div(BigNumber.from(10).pow(decimals));
};

export async function checkTradeLoss(
  network: Network,
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
    network,
    [sellToken, buyToken]
  );
  const sellAmountInUsd = convertToUsd(
    sellAmount,
    sellTokenData.decimals,
    sellTokenData.price
  );
  const buyAmountInUsd = convertToUsd(
    buyAmount,
    buyTokenData.decimals,
    buyTokenData.price
  );
  const lossPercentage =
    sellAmountInUsd
      .sub(buyAmountInUsd)
      .mul(10000)
      .div(sellAmountInUsd)
      .toNumber() / 100;

  const acceptableLoss =
    acceptablePercentageLoss[network][sellToken] ||
    DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS;

  return {
    acceptable: lossPercentage <= acceptableLoss,
    lossPercentage,
    sellTokenPrice: sellTokenData.price,
    buyTokenPrice: buyTokenData.price,
    priceDecimals: 18,
  };
}
