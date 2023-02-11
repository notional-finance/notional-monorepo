import { Network, OracleDefinition, OracleInterface } from '../Definitions';

const assignDefaults = (
  list: Partial<OracleDefinition>[],
  defaultProps: Partial<OracleDefinition>
) => list.map((o) => Object.assign(o, defaultProps));

// Chainlink price feeds can be found here: https://docs.chain.link/data-feeds/price-feeds/addresses
const mainnetChainlinkUSD = assignDefaults(
  [
    {
      address: 'eth-usd.data.eth',
      heartbeat: 3600,
      base: 'ETH',
    },
    {
      address: 'btc-usd.data.eth',
      heartbeat: 3600,
      base: 'BTC',
    },
    {
      address: 'dai-usd.data.eth',
      heartbeat: 3600,
      base: 'DAI',
    },
    {
      address: 'usdc-usd.data.eth',
      heartbeat: 3600,
      base: 'USDC',
    },
    {
      address: 'usdt-usd.data.eth',
      heartbeat: 3600,
      base: 'USDT',
    },
    {
      address: 'comp-usd.data.eth',
      heartbeat: 3600,
      base: 'COMP',
    },
    {
      // NOTE: unmarked chainlink oracle stETH/USD
      address: '0xcfe54b5cd566ab89272946f602d76ea879cab4a8',
      heartbeat: 3600,
      base: 'stETH',
    },
    {
      // NOTE: custom oracle deployed by Notional
      address: '0x8770d8dEb4Bc923bf929cd260280B5F1dd69564D',
      heartbeat: 86400,
      base: 'wstETH',
    },
  ],
  { oracleInterface: OracleInterface.Chainlink, quote: 'USD', decimalPlaces: 8 }
);

const mainnetChainlinkCrypto = assignDefaults(
  [
    {
      address: 'wbtc-btc.data.eth',
      heartbeat: 86400,
      base: 'WBTC',
      quote: 'BTC',
      decimalPlaces: 8,
    },
    {
      address: 'bal-eth.data.eth',
      heartbeat: 86400,
      base: 'BAL',
      quote: 'ETH',
      decimalPlaces: 18,
    },
    {
      address: 'steth-eth.data.eth',
      heartbeat: 86400,
      base: 'stETH',
      quote: 'ETH',
      decimalPlaces: 18,
    },
  ],
  { oracleInterface: OracleInterface.Chainlink }
);

const compundV2AssetRates = assignDefaults(
  [
    {
      address: '0x8e3d447ebe244db6d28e2303bca86ef3033cfad6',
      quote: 'cETH',
      base: 'ETH',
    },
    {
      address: '0x719993e82974f5b5ea0c5eba25c260cd5af78e00',
      quote: 'cDAI',
      base: 'DAI',
    },
    {
      address: '0x612741825acedc6f88d8709319fe65bcb015c693',
      quote: 'cUSDC',
      base: 'USDC',
    },
    {
      address: '0x39d9590721331b13c8e9a42941a2b961b513e69d',
      quote: 'cWBTC',
      base: 'WBTC',
    },
  ],
  { oracleInterface: OracleInterface.CompoundV2_cToken }
);

const mainnetChainlinkFiat = assignDefaults(
  [
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
  ].map((base) => {
    return {
      address: `${base.toLowerCase()}-usd.data.eth`,
      base,
    };
  }),
  {
    oracleInterface: OracleInterface.Chainlink,
    heartbeat: 86400,
    quote: 'USD',
    decimalPlaces: 8,
  }
);

const assignNetwork = (
  oracles: Partial<OracleDefinition>[][],
  network: Network
): [Network, OracleDefinition[]] => [
  network,
  oracles.flat().map((o) => {
    // Adds the network to the oracle object and adds it to a mapping
    return Object.assign(o, { network }) as OracleDefinition;
  }),
];

const defaultOracles = [
  assignNetwork(
    [mainnetChainlinkCrypto, mainnetChainlinkUSD, compundV2AssetRates],
    Network.Mainnet
  ),
  assignNetwork([mainnetChainlinkFiat], Network.All),
];

export default defaultOracles;
