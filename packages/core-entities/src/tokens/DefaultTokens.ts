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

const mainnet = assignDefaults(
  {
    ETH: {
      address: ethers.constants.AddressZero,
      decimalPlaces: 18,
      // Overrides default property of ERC20
      tokenInterface: TokenInterface.ETH,
    },
    ALT_ETH: {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimalPlaces: 18,
      // Overrides default property of ERC20
      tokenInterface: TokenInterface.ETH,
    },
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimalPlaces: 18,
      // Overrides default property of ERC20
      tokenInterface: TokenInterface.WETH,
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimalPlaces: 18,
    },
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimalPlaces: 6,
    },
    WBTC: {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      decimalPlaces: 8,
    },
    wstETH: {
      address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      decimalPlaces: 18,
    },
    stETH: {
      address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      decimalPlaces: 18,
    },
    COMP: {
      address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
      decimalPlaces: 18,
    },
    BAL: {
      address: '0xba100000625a3754423978a60c9317c58a424e3D',
      decimalPlaces: 18,
    },
    NOTE: {
      address: '0xCFEAead4947f0705A14ec42aC3D44129E1Ef3eD5',
      decimalPlaces: 8,
    },
    sNOTE: {
      address: '0x38DE42F4BA8a35056b33A746A6b45bE9B1c3B9d2',
      decimalPlaces: 18,
    },
    // Compound V2 Tokens
    cETH: {
      address: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
      decimalPlaces: 8,
    },
    cDAI: {
      address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
      decimalPlaces: 8,
    },
    cUSDC: {
      address: '0x39aa39c021dfbae8fac545936693ac917d5e7563',
      decimalPlaces: 8,
    },
    cWBTC: {
      address: '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
      decimalPlaces: 8,
    },
    // Notional nTokens
    nETH: {
      address: '0xabc07bf91469c5450d6941dd0770e6e6761b90d6',
      decimalPlaces: 8,
    },
    nDAI: {
      address: '0x6ebce2453398af200c688c7c4ebd479171231818',
      decimalPlaces: 8,
    },
    nUSDC: {
      address: '0x18b0fc5a233acf1586da7c199ca9e3f486305a29',
      decimalPlaces: 8,
    },
    nWBTC: {
      address: '0x0ace2dc3995acd739ae5e0599e71a5524b93b886',
      decimalPlaces: 8,
    },
    cbETH: {
      address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
      decimalPlaces: 18,
    },
    frxETH: {
      address: '0x5E8422345238F34275888049021821E8E08CAa1f',
      decimalPlaces: 18,
    },
  },
  { tokenInterface: TokenInterface.ERC20 }
);

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
