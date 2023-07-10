import { BigNumber } from 'ethers';
import { Network } from '@notional-finance/util';
import { TokenDefinition, OracleDefinition } from '..';

export const FIAT_SYMBOLS = [
  'EUR',
  'AUD',
  'CAD',
  'CHF',
  'GBP',
  'JPY',
  'CNY',
  'KRW',
  'NZD',
  'BRL',
  'SGD',
  'TRY',
  'ETH',
  'USD',
  'NOTE',
] as const;
export type FiatKeys = typeof FIAT_SYMBOLS[number];

const assignTokenDefaults = (
  obj: Record<FiatKeys, Partial<TokenDefinition>>,
  defaultProps: Partial<TokenDefinition>
): TokenDefinition[] =>
  Object.entries(obj).map(
    ([key, value]) =>
      Object.assign(
        {},
        defaultProps,
        {
          id: key.toLowerCase(),
          symbol: key,
          name: key,
          address: key.toLowerCase(),
        },
        value
      ) as TokenDefinition
  );

/**
 * Defines supported Fiat balances across all networks
 */
export const fiatTokens: [string, TokenDefinition][] = assignTokenDefaults(
  {
    USD: {},
    EUR: {},
    AUD: {},
    CAD: {},
    CHF: {},
    GBP: {},
    JPY: {},
    CNY: {},
    KRW: {},
    NZD: {},
    BRL: {},
    SGD: {},
    TRY: {},
    ETH: {
      // This is used as a base to convert to Fiat currencies
      decimals: 18,
    },
    NOTE: {
      // This is used to get the NOTE price from mainnet across all networks
      network: Network.All,
      tokenInterface: 'ERC20',
      decimals: 8,
      tokenType: 'NOTE',
      symbol: 'NOTE',
      name: 'Notional',
      address: '0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5',
    },
  },
  {
    network: Network.All,
    tokenInterface: 'FIAT',
    decimals: 6,
    tokenType: 'Fiat',
  }
).map((t) => [t.id.toLowerCase(), t]);

const assignOracleDefaults = (
  list: Partial<OracleDefinition>[],
  defaultProps: Partial<OracleDefinition>
) => list.map((o) => Object.assign({}, defaultProps, o) as OracleDefinition);

export const fiatOracles: [string, OracleDefinition][] = assignOracleDefaults(
  FIAT_SYMBOLS.filter((quote) => quote !== 'USD').map((quote) => {
    if (quote === 'NOTE') {
      return {
        id: 'eth:note:sNOTE',
        oracleType: 'sNOTE',
        oracleAddress: '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7',
        base: 'eth',
        quote: 'note',
        decimals: 18,
        network: Network.All,
        latestRate: {
          rate: BigNumber.from(0),
          timestamp: 0,
          blockNumber: 0,
        },
      };
    }

    return {
      oracleAddress: `${quote.toLowerCase()}-usd.data.eth`,
      quote: quote.toLowerCase(),
      id: `usd:${quote.toLowerCase()}:Chainlink`,
    };
  }),
  {
    oracleType: 'Chainlink',
    base: 'usd',
    decimals: 8,
    network: Network.All,
    latestRate: {
      rate: BigNumber.from(0),
      timestamp: 0,
      blockNumber: 0,
    },
  }
).map((c) => [c.id, c]);
