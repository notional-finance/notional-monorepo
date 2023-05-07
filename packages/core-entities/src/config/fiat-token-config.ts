import { ethers } from 'ethers';
import { TokenDefinition } from '../definitions';

const assignDefaults = (
  obj: Record<string, Partial<TokenDefinition>>,
  defaultProps: Partial<TokenDefinition>
): [string, TokenDefinition][] =>
  Object.entries(obj).map(([key, value]) => [
    key,
    Object.assign({}, defaultProps, value, { symbol: key }) as TokenDefinition,
  ]);

/**
 * Defines supported Fiat balances across all networks
 */
const fiat = assignDefaults(
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
  },
  {
    tokenInterface: 'FIAT',
    address: ethers.constants.AddressZero,
    decimals: 6,
  }
);

// Add lists of other default tokens on networks here
const defaultTokens = new Map<string, TokenDefinition>(fiat);

/**
 * Returns a list of default underlying tokens across supported networks
 * to populate the TokenRegistry. This is not a complete list but allows
 * the TokenRegistry and TokenBalance to function independently of any
 * online cache.
 */
export default defaultTokens;
