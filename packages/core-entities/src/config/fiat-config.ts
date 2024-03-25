import { BigNumber } from 'ethers';
import { Network } from '@notional-finance/util';
import { TokenDefinition, OracleDefinition } from '..';

export const FIAT_NAMES = [
  'EUR',
  'AUD',
  'CAD',
  'CHF',
  'GBP',
  'JPY',
  'CNY',
  'KRW',
  'NZD',
  'SGD',
  'TRY',
  'ETH',
  'USD',
  'NOTE',
] as const;

export type FiatKeys = typeof FIAT_NAMES[number];

export const FiatSymbols: Record<FiatKeys, string> = FIAT_NAMES.filter(
  (k) => k !== 'NOTE'
).reduce((o, s) => {
  if (s === 'ETH') return Object.assign(o, { [s]: 'Ξ' });

  return Object.assign(o, {
    // Trims the currency symbol
    [s]: (0)
      .toLocaleString('en-US', {
        style: 'currency',
        currency: s,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, '')
      .trim(),
  });
}, {} as Record<FiatKeys, string>);

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
    SGD: {},
    TRY: {},
    ETH: {
      // This is used as a base to convert to Fiat currencies
      decimals: 18,
    },
    NOTE: {
      // This is used to get the NOTE price from mainnet across all networks
      network: Network.all,
      tokenInterface: 'ERC20',
      decimals: 8,
      tokenType: 'NOTE',
      symbol: 'NOTE',
      name: 'Notional',
      address: '0xcfeaead4947f0705a14ec42ac3d44129e1ef3ed5',
    },
  },
  {
    network: Network.all,
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
  FIAT_NAMES.filter((quote) => quote !== 'USD').map((quote) => {
    if (quote === 'NOTE') {
      return {
        id: 'eth:note:sNOTE',
        oracleType: 'sNOTE',
        oracleAddress: '0x5122e01d819e58bb2e22528c0d68d310f0aa6fd7',
        base: 'eth',
        quote: 'note',
        decimals: 18,
        network: Network.all,
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
    network: Network.all,
    latestRate: {
      rate: BigNumber.from(0),
      timestamp: 0,
      blockNumber: 0,
    },
  }
).map((c) => [c.id, c]);
