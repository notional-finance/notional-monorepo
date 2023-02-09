import { Network, OracleDefinition, OracleInterface } from './Definitions';

const assignDefaults = (
  list: Partial<OracleDefinition>[],
  defaultProps: Partial<OracleDefinition>
) => list.map((o) => Object.assign(defaultProps, o));

const mainnetChainlinkUSD = assignDefaults(
  [
    {
      address: 'eth-usd.data.eth',
      heartbeat: 3600,
      base: 'ETH',
    },
  ],
  { oracleInterface: OracleInterface.Chainlink, quote: 'USD', decimalPlaces: 8 }
);

const mainnetChainlinkETH = assignDefaults([], {
  oracleInterface: OracleInterface.Chainlink,
  quote: 'ETH',
});

const mainnetChainlinkFiat = assignDefaults([], {
  oracleInterface: OracleInterface.Chainlink,
  quote: 'USD',
});

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
  assignNetwork([mainnetChainlinkETH, mainnetChainlinkUSD], Network.Mainnet),
  assignNetwork([mainnetChainlinkFiat], Network.All),
];

export default defaultOracles;
