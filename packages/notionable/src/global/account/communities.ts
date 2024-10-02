import {
  Network,
  getProviderFromNetwork,
  getProviderURLFromNetwork,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { COMMUNITY_NAMES } from '../global-state';

export const GATED_VAULTS: Record<string, COMMUNITY_NAMES[]> = {};

export interface Community {
  name: COMMUNITY_NAMES;
  displayName: string;
  address: string;
  network: Network;
  tokenId?: string;
}

export const CommunityNFTs: Community[] = [
  // {
  //   name: COMMUNITY_NAMES.DEGEN_SCORE,
  //   displayName: 'Degen Score',
  //   address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
  //   network: Network.mainnet,
  // },
  {
    name: COMMUNITY_NAMES.LLAMAS,
    displayName: 'Llama',
    address: '0xe127ce638293fa123be79c25782a5652581db234',
    network: Network.mainnet,
  },
  // {
  //   name: COMMUNITY_NAMES.V3_BETA_CONTEST,
  //   displayName: 'Notional Beta Contest',
  //   address: '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e',
  //   network: Network.arbitrum,
  // },
  {
    name: COMMUNITY_NAMES.CONTEST_PASS,
    displayName: 'Notional Contest Pass',
    address: '0xbBEF91111E9Db19E688B495972418D8ebC11F008',
    network: Network.arbitrum,
  },
];

// Assign a new id number to each community, used for minting contest passes
export const CommunityId: Record<COMMUNITY_NAMES, number> = {
  [COMMUNITY_NAMES.CRYPTO_TESTERS]: 1,
  [COMMUNITY_NAMES.L2DAO]: 2,
  [COMMUNITY_NAMES.LLAMAS]: 3,
  [COMMUNITY_NAMES.DEGEN_SCORE]: 4,
  [COMMUNITY_NAMES.V3_BETA_CONTEST]: 5,
  [COMMUNITY_NAMES.CONTEST_PASS]: 6,
};

interface NFTResponse {
  ownedNfts: {
    contractAddress: string;
    id: { tokenId: string };
    balance: string;
  }[];
  totalCount: number;
}

export async function checkCommunityMembership(account: string) {
  return (
    await Promise.all(
      CommunityNFTs.map(async ({ network, name, address, displayName }) => {
        const providerURL = getProviderURLFromNetwork(network, true);
        const url = `${providerURL}/getNFTs?owner=${account}&contractAddresses[]=${address}&withMetadata=false`;
        try {
          const response = await fetch(url);
          const data: NFTResponse = await response.json();
          if (data.totalCount === 0) return undefined;

          // Always returns the highest valued token id. This works for the contest NFT where the highest order
          // byte corresponds to the contest id which should be incrementing
          const tokenId = data.ownedNfts
            .map(({ id }) => BigNumber.from(id.tokenId))
            .sort((a, b) => (a.lt(b) ? -1 : 1))
            .pop();

          return { network, name, address, displayName, tokenId };
        } catch (_error) {
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
    getProviderFromNetwork(Network.mainnet)
  );
  return sanctionList['isSanctioned'](account) as Promise<boolean>;
}
