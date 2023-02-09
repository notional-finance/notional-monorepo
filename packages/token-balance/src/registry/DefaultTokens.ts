import { ethers } from 'ethers';
import { Network, TokenDefinition, TokenInterface } from './Definitions';

const assignDefaults = (
  obj: Record<string, Partial<TokenDefinition>>,
  defaultProps: Partial<TokenDefinition>
): [string, TokenDefinition][] =>
  Object.entries(obj).map(([key, value]) => [
    key,
    Object.assign(defaultProps, value, { symbol: key }) as TokenDefinition,
  ]);

const mainnet = assignDefaults(
  {
    ETH: {
      address: ethers.constants.AddressZero,
      decimalPlaces: 18,
      // Overrides default property of ERC20
      tokenInterface: TokenInterface.ETH,
    },
    WETH: {
      address: ethers.constants.AddressZero,
      decimalPlaces: 18,
      // Overrides default property of ERC20
      tokenInterface: TokenInterface.WETH,
    },
    // {
    //   address:
    //   symbol: 'DAI',
    //   decimalPlaces: 18,
    // },
    // {
    //   address:
    //   symbol: 'USDC',
    //   decimalPlaces: 6,
    // },
    // {
    //   address:
    //   symbol: 'WBTC',
    //   decimalPlaces: 8,
    // },
    // {
    //   address:
    //   symbol: 'wstETH',
    //   decimalPlaces: 18,
    // },
    // {
    //   address:
    //   symbol: 'stETH',
    //   decimalPlaces: 18,
    // },
    // {
    //   address:
    //   symbol: 'COMP',
    //   decimalPlaces: 18,
    // },
    // {
    //   address:
    //   symbol: 'NOTE',
    //   decimalPlaces: 8,
    // },
    // {
    //   address:
    //   symbol: 'sNOTE',
    //   decimalPlaces: 8,
    // },
    // TODO: add cTokens, eTokens, aTokens, etc.
  },
  { tokenInterface: TokenInterface.ERC20 }
);

/**
 * Defines supported Fiat balances across all networks
 */
const fiat = assignDefaults(
  {
    USD: {},
    JPY: {},
    EUR: {},
    CNY: {},
    AUD: {},
    GBP: {},
    CAD: {},
    CHF: {},
  },
  {
    tokenInterface: TokenInterface.FIAT,
    address: ethers.constants.AddressZero,
    decimalPlaces: 6,
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
  assignNetwork(mainnet, Network.Mainnet),
  assignNetwork(fiat, Network.All),
]);

/**
 * Returns a list of default underlying tokens across supported networks
 * to populate the TokenRegistry. This is not a complete list but allows
 * the TokenRegistry and TokenBalance to function independently of any
 * online cache.
 */
export default defaultTokens;
