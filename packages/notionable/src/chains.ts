import { Chain } from '@web3-onboard/common';
export const chains: Chain[] = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'global.network.mainnet',
    rpcUrl:
      'https://eth-mainnet.alchemyapi.io/v2/JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz',
  },
  {
    id: '0x5',
    token: 'gETH',
    label: 'global.network.goerli',
    rpcUrl:
      'https://eth-goerli.alchemyapi.io/v2/u9PaziJgX-8l4j8_c88b777-Io4scNUe',
  },
  // {
  //   id: '0x539',
  //   token: 'ETH',
  //   label: 'Local',
  //   rpcUrl: 'http://localhost:8545',
  // },
];

export const chainIds = chains.map((chain) => parseInt(chain.id));
export const chainEntities = chains.reduce(
  (prev, chain) => ({ ...prev, [chain.id]: chain }),
  {}
);
