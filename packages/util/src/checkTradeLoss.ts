import { Network } from './constants';
import { BigNumber } from 'ethers';

const DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS = 5;
const acceptablePercentageLoss = {
  [Network.mainnet]: {},
  [Network.arbitrum]: {},
};

async function getTokensPricesFromDefiLlama(
  network: string,
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

  return coinsData;
}

/**
 *
 * @param price - decimal number
 * @returns {BigNumber} USD value, BigNumber with 18 decimals
 */
const convertToUsd = (amount: BigNumber, decimals: number, price: number) => {
  // 1e15 is maximum number we can multiply price with without precision loss
  const priceBigNumber = BigNumber.from((price * 1e15).toFixed(0)).mul(1e3);
  return amount.mul(priceBigNumber).div(BigNumber.from(10).pow(decimals));
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
  const percentageLoss = sellAmountInUsd
    .sub(buyAmountInUsd)
    .mul(100)
    .div(sellAmountInUsd)
    .toNumber();

  const acceptableLoss =
    acceptablePercentageLoss[network][sellToken] ||
    DEFAULT_ACCEPTABLE_PERCENTAGE_LOSS;

  if (percentageLoss > acceptableLoss) {
    return { acceptable: false, percentageLoss };
  }

  return { acceptable: true, percentageLoss };
}
