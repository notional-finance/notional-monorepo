import { Network } from '@notional-finance/util';
import { OracleDefinition } from '..';

const assignDefaults = (
  list: Partial<OracleDefinition>[],
  defaultProps: Partial<OracleDefinition>
) => list.map((o) => Object.assign({}, defaultProps, o));

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
    oracleType: 'Chainlink',
    quote: 'USD',
    decimals: 8,
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

const defaultOracles = [assignNetwork([mainnetChainlinkFiat], Network.All)];

export default defaultOracles;
