import {
  Network,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
} from '@notional-finance/util';
import { Contract } from 'ethers';
import { COMMUNITY_NAMES } from '../global-state';


export const GATED_VAULTS: Record<string, COMMUNITY_NAMES[]> = {};

export interface Community {
  name: COMMUNITY_NAMES;
  displayName: string;
  address: string;
  network: Network;
}

export const CommunityNFTs: Community[] = [
  // {
  //   name: COMMUNITY_NAMES.DEGEN_SCORE,
  //   displayName: 'Degen Score',
  //   address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
  //   network: Network.Mainnet,
  // },
  {
    name: COMMUNITY_NAMES.L2DAO,
    displayName: 'L2DAO',
    address: '0x66deb6cc4d65dc9cb02875dc5e8751d71fa5d50e',
    network: Network.Optimism,
  },
  {
    name: COMMUNITY_NAMES.CRYPTO_TESTERS,
    displayName: 'Cryptotesters',
    address: '0x18a1bc18cefdc952121f319039502fdd5f48b6ff',
    network: Network.Optimism,
  },
  {
    name: COMMUNITY_NAMES.LLAMAS,
    displayName: 'Llama',
    address: '0xe127ce638293fa123be79c25782a5652581db234',
    network: Network.Mainnet,
  },
  // {
  //   name: COMMUNITY_NAMES.V3_BETA_CONTEST,
  //   displayName: 'Notional Beta Contest',
  //   address: '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e',
  //   network: Network.ArbitrumOne,
  // },
];

export async function checkCommunityMembership(account: string) {
  return (
    await Promise.all(
      CommunityNFTs.map(async ({ network, name, address, displayName }) => {
        console.log("TESSTING")
        const providerURL = getProviderURLFromNetwork(network, true);
        const url = `${providerURL}/getNFTs?owner=${account}&contractAddresses[]=${address}&withMetadata=false`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          return data.totalCount > 0 ? { network, name, address, displayName } : undefined;
        } catch (error) {
          return undefined;
        }
      })
    )
  ).filter((m) => m !== undefined) as Community[];
}

export function checkSanctionedAddress(account: string) {
  const sanctionList = new Contract(
    '0x40c57923924b5c5c5455c48d93317139addac8fb',
    ['function isSanctioned(address) view returns (bool)'],
    getProviderFromNetwork(Network.Mainnet)
  );
  return sanctionList['isSanctioned'](account) as Promise<boolean>;
}
