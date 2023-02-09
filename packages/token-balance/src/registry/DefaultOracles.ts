import { Network, OracleDefinition, OracleInterface } from './Definitions';

const assignDefaults = (
  obj: Record<string, Partial<OracleDefinition>>,
  defaultProps: Partial<OracleDefinition>
) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      Object.assign(defaultProps, value, { base: key }) as OracleDefinition,
    ])
  );
};

const mainnetChainlinkUSD = assignDefaults(
  {
    ETH: {
      address: 'eth-usd.data.eth',
      heartbeat: 3600,
    },
  },
  { oracleInterface: OracleInterface.Chainlink, quote: 'USD', decimalPlaces: 8 }
);

const mainnetChainlinkETH = assignDefaults(
  {},
  { oracleInterface: OracleInterface.Chainlink, quote: 'ETH' }
);

const mainnetChainlinkFiat = assignDefaults(
  {},
  { oracleInterface: OracleInterface.Chainlink, quote: 'USD' }
);

const defaultOracles = Object.fromEntries([
  [
    Network.Mainnet,
    // NOTE: USD oracles will supercede ETH oracles if duplicates are defined
    assignDefaults(Object.assign(mainnetChainlinkETH, mainnetChainlinkUSD), {
      network: Network.Mainnet,
    }),
  ],
  [Network.All, assignDefaults(mainnetChainlinkFiat, { network: Network.All })],
]) as Record<Network, Record<string, OracleDefinition>>;

export default defaultOracles;
