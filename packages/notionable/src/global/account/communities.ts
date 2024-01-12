import {
  Network,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
} from '@notional-finance/util';
import { Contract } from 'ethers';

export type CommunityName = 'DEGEN_SCORE' | 'V3_BETA_CONTEST';

interface Community {
  name: CommunityName;
  address: string;
  network: Network;
}

export const CommunityNFTs: Community[] = [
  {
    name: 'DEGEN_SCORE',
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
  },
  {
    name: 'V3_BETA_CONTEST',
    address: '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e',
    network: Network.ArbitrumOne,
  },
];

export async function checkCommunityMembership(account: string) {
  return (
    await Promise.all(
      CommunityNFTs.map(async ({ network, name, address }) => {
        const providerURL = getProviderURLFromNetwork(network, true);
        const url = `${providerURL}/getNFTs?owner=${account}&contractAddresses[]=${address}&withMetadata=false`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          return data.totalCount > 0 ? name : undefined;
        } catch (error) {
          return undefined;
        }
      })
    )
  ).filter((m) => m !== undefined) as CommunityName[];
}

export function checkSanctionedAddress(account: string) {
  const sanctionList = new Contract(
    '0x40c57923924b5c5c5455c48d93317139addac8fb',
    ['function isSanctioned(address) view returns (bool)'],
    getProviderFromNetwork(Network.Mainnet)
  );
  return sanctionList['isSanctioned'](account) as Promise<boolean>;
}
