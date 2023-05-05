import { ethers } from 'ethers';
import { Network, TokenDefinition, TokenInterface } from '../Definitions';

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
    tokenInterface: TokenInterface.FIAT,
    address: ethers.constants.AddressZero,
    decimals: 6,
  }
);

const assignNetwork = (
  t: [string, TokenDefinition][],
  network: Network
): [Network, Map<string, TokenDefinition>] => [
  network,
  new Map<string, TokenDefinition>(
    t.map(([k, v]) => [k, Object.assign(v, { network })])
  ),
];

// Add lists of other default tokens on networks here
const defaultTokens = new Map<Network, Map<string, TokenDefinition>>([
  assignNetwork(fiat, Network.All),
]);

/**
 * Returns a list of default underlying tokens across supported networks
 * to populate the TokenRegistry. This is not a complete list but allows
 * the TokenRegistry and TokenBalance to function independently of any
 * online cache.
 */
export default defaultTokens;
