// Types for the API response from /collections/vaults

import { Network } from '@notional-finance/util';

// This maps the CMS API response structure to our internal VaultModel
interface ApiVaultFeature {
  name: string;
  slug: string;
}

interface ApiProject {
  name: string;
  slug: string;
  'project-logo': {
    fileId: string;
    url: string;
    alt: string | null;
  };
}

interface ApiReward {
  'is-points': boolean;
  name: string;
  slug: string;
  'issuing-project': ApiProject;
  'token-address-2': {
    name: string;
    slug: string;
    network: {
      name: string;
    };
    'contract-address': string;
    'is-vault': boolean;
  };
}

// This is the shape of the vault data returned from the CMS API and fully
// dereferenced.
export interface ApiVaultData {
  id: string;
  fieldData: {
    name: string;
    slug: string;
    'vault-features': ApiVaultFeature[];
    'launched-on': string;
    projects: ApiProject[];
    rewards: ApiReward[];
    'is-visible': boolean;
    'strategy-type-2': {
      name: string;
      slug: string;
    };
    'vault-address-2': {
      'is-vault': boolean;
      name: string;
      slug: string;
      network: {
        name: string;
      };
      'contract-address': string;
    };
    'deposit-token-2': {
      name: string;
      slug: string;
      network: {
        name: string;
      };
      'contract-address': string;
    };
    'vault-description'?: string;
  };
}

export interface ProjectDefinition {
  id: string;
  name: string;
  logoURL: string;
  description: string;
}

export interface RewardDefinition {
  id: string;
  name: string;
  token: string;
}

export interface VaultAssetDefinition {
  id: string;
  name: string;
  contractAddress: string;
  logoURL: string;
  description: string;
}

export interface VaultCMSData {
  name: string;
  address: string;
  network: Network;
  vaultIcon: string;
  depositToken: string;
  vaultFeatures: string[];
  isVisible: boolean;
  launchedOn: number;
  strategyClass: string;
  vaultDescription: string;
  projects: ProjectDefinition[];
  rewards: RewardDefinition[];
  vaultAssets: VaultAssetDefinition[];
}
