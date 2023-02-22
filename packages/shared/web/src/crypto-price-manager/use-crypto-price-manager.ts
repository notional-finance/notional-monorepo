import { updateCryptoPriceState } from './store/crypto-price-store';
import { useCryptoPriceState } from './store/use-crypto-price-state';
import { convertArrayToObject, logError } from '@notional-finance/helpers';

interface ResponseData {
  symbol: string;
  market_data: {
    price_change_percentage_7d_in_currency: {
      [key: string]: number;
    };
    price_change_percentage_24h_in_currency: {
      [key: string]: number;
    };
    current_price: {
      [key: string]: number;
    };
  };
}

export const useCryptoPriceManager = () => {
  const { cryptoPrices } = useCryptoPriceState();
  const fiatKey = 'usd';
  const coinGeckoKeys = [
    'ethereum',
    'bitcoin',
    'wrapped-bitcoin',
    'dai',
    'usd-coin',
  ];

  if (Object.keys(cryptoPrices).length === 0) {
    const priceDataPromises = coinGeckoKeys.map((key) => {
      return fetch(`https://api.coingecko.com/api/v3/coins/${key}`)
        .then((resp) => {
          return resp.json();
        })
        .then((data: ResponseData) => {
          const {
            market_data: {
              price_change_percentage_7d_in_currency,
              price_change_percentage_24h_in_currency,
              current_price,
            },
            symbol,
          } = data;

          return {
            '7D': price_change_percentage_7d_in_currency[fiatKey],
            '24H': price_change_percentage_24h_in_currency[fiatKey],
            price: current_price[fiatKey],
            symbol: symbol,
          };
        })
        .catch((error) => {
          logError(
            error as Error,
            'web/crypto-price-manager',
            'use-crypto-price-manager'
          );
          return {
            '7D': 0,
            '24H': 0,
            price: 0,
            symbol: '',
          };
        });
    });

    if (priceDataPromises.length > 0) {
      Promise.all(priceDataPromises).then((values) => {
        // TODO: Fix this type error properly
        const formattedValues = convertArrayToObject(values, 'symbol');
        updateCryptoPriceState({ cryptoPrices: formattedValues });
      });
    }
  }
};
