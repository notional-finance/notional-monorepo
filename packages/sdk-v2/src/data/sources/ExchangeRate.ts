import { BigNumber, ethers } from 'ethers';
import { fetch as crossFetch } from 'cross-fetch';

const EXCHANGE_RATE_API = (KEY: string) => `https://v6.exchangerate-api.com/v6/${KEY}/latest/USD`;
const SUPPORTED_RATES = ['EUR', 'JPY', 'CNY', 'AUD', 'GBP', 'CAD', 'CHF'];

// Converts a decimal value to Wei BigNumber
function convertToWei(val: number) {
  // Convert USD Price to BigNumber in 18 decimals, uses the first 8 decimals of the
  // avgUSDPrice, using 18 decimals will overflow in javascript math
  return BigNumber.from(Math.floor(val * 10 ** 8))
    .mul(ethers.constants.WeiPerEther)
    .div(10 ** 8);
}

async function getExchangeRateData(symbols: string[], key: string, _fetch: any) {
  const resp: Response = await _fetch(EXCHANGE_RATE_API(key));
  if (!resp.ok) {
    throw Error(`Exchange rate api failed: ${resp.status}, ${resp.statusText}`);
  }
  const data = await resp.json();
  return symbols.reduce((obj, s) => {
    const ret = obj;
    if (data.conversion_rates[s]) {
      ret[s] = convertToWei(data.conversion_rates[s]);
    }
    return ret;
  }, {});
}

/**
// Returns the 24 hour avg of the USD price
// Currently this function is unused, may enable it again in the future
async function getCoingeckoUSDPrice(url: string, _fetch: any) {
  const resp = await _fetch(url);
  if (!resp.ok) {
    throw Error(`CoinGecko api failed: ${resp.status}, ${resp.statusText}`);
  }

  const data = (await resp.json()) as { prices: [number, number][] };
  const sortedPrices: Array<[number, number]> = data.prices.sort(([a], [b]) => a - b);
  let avgUSDPrice: number;
  if (sortedPrices.length === 1) {
    // eslint-disable-next-line prefer-destructuring
    [, avgUSDPrice] = sortedPrices[0];
  } else {
    const timeRange = sortedPrices[sortedPrices.length - 1][0] - sortedPrices[0][0];

    // Gets a weighted average of the price
    avgUSDPrice =
      sortedPrices.reduce((weightedNum, [time, price], i) => {
        // Reached end of list, don't use price
        if (i === sortedPrices.length - 1) return weightedNum;
        return weightedNum + (sortedPrices[i + 1][0] - time) * price;
      }, 0) / timeRange;
  }

  return convertToWei(avgUSDPrice);
}
*/

export default async function getUSDPriceData(
  apiKey: string,
  skipFetchSetup: boolean
): Promise<Record<string, BigNumber>> {
  const _fetch = skipFetchSetup ? fetch : crossFetch;
  const EX_RATES = await getExchangeRateData(SUPPORTED_RATES, apiKey, _fetch);
  return { ...EX_RATES };
}
