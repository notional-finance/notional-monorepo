/**
 * VaultModel - MobX State Tree models for vault data
 *
 * This file contains the models and mapping logic to transform vault data
 * from the CMS API (/collections/vaults) into the internal VaultModel structure.
 *
 * Usage:
 * 1. The VaultStore is automatically created in the root store
 * 2. Call refreshVaultData() to fetch and map vault data from the API
 * 3. Access vaults through the store: rootStore.vaultStore.vaults
 *
 * Example API response structure is defined in the ApiVaultData interface below.
 *
 * Mapping Example:
 * API Data:
 * {
 *   "fieldData": {
 *     "name": "Test Vaults",
 *     "vault-features": [{"name": "Instant Redemption"}],
 *     "launched-on": "2025-06-10T18:55:00.000Z",
 *     "strategy-type-2": {"name": "Liquidity"},
 *     "vault-address-2": {
 *       "network": {"name": "Ethereum"},
 *       "contract-address": "0x123..."
 *     }
 *   }
 * }
 *
 * Maps to VaultModel:
 * {
 *   name: "Test Vaults",
 *   vaultFeatures: "Instant Redemption",
 *   launchedOn: Date("2025-06-10T18:55:00.000Z"),
 *   strategyType: "Liquidity",
 *   network: Network.mainnet,
 *   vaultAddress: "0x123..."
 * }
 */

import {
  getRoot,
  Instance,
  types,
  flow,
  getType,
  getParent,
} from 'mobx-state-tree';
import {
  NotionalTypes,
  TokenDefinitionModel,
} from '@notional-finance/core-entities';
import { Network } from '@notional-finance/util';
import { RootStoreInterface } from './root-store';
import { TradeModel } from './TradeModel';

const TokenDefinitionReference = types.reference(TokenDefinitionModel, {
  get(identifier, parent) {
    const root = () => getRoot<RootStoreInterface>(parent);
    const parentName = getType(parent).name;

    let selectedNetwork: Network | undefined;

    switch (parentName) {
      case 'VaultModel':
        // TODO: get this from the parent some how
        selectedNetwork = Network.mainnet;
        break;
      default:
        selectedNetwork =
          getParent<Instance<typeof TradeModel>>(parent)?.selectedNetwork;
    }

    if (!selectedNetwork) {
      console.error('Parent reference lookup failed for:', {
        parentName,
        identifier,
        parent,
      });
      throw Error(
        `Token Definition parent reference not found for ${parentName}`
      );
    }

    const model = root().getNetworkClient(selectedNetwork);
    return model.getTokenByID(identifier.toString()) as Instance<
      typeof TokenDefinitionModel
    >;
  },
  set(value) {
    return value.id;
  },
});

const ProjectModel = types.model('ProjectModel', {
  id: types.identifier,
  name: types.string,
  description: types.string,
  logoURL: types.string,
});

const RewardModel = types.model('RewardModel', {
  id: types.identifier,
  name: types.string,
  token: types.maybe(TokenDefinitionReference),
  isPoints: types.boolean,
  pointMultiplier: types.number,
  issuingProject: types.string, // Changed from reference to simple string
});

const VaultModel = types
  .model('VaultModel', {
    name: types.string,
    network: NotionalTypes.Network,
    vaultAddress: types.string,
    depositToken: TokenDefinitionReference,
    vaultFeatures: types.array(types.string),
    launchedOn: types.Date,
    strategyType: types.string,
    vaultDescription: types.string,
    rewards: types.optional(types.array(RewardModel), []),
    projects: types.optional(types.array(ProjectModel), []),
  })
  .actions((self) => ({
    setRewards(rewards: Instance<typeof RewardModel>[]) {
      self.rewards.replace(rewards);
    },
  }));

const VaultStore = types.model('VaultStore', {
  vaults: types.optional(types.array(VaultModel), []),
});

// Types for the API response from /collections/vaults
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

interface ApiVaultData {
  id: string;
  fieldData: {
    name: string;
    slug: string;
    'vault-features': ApiVaultFeature[];
    'launched-on': string;
    projects: ApiProject[];
    rewards: ApiReward[];
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

const VaultActions = (self: Instance<typeof VaultStore>) => {
  // const root = () => getRoot<RootStoreInterface>(self);

  const refreshVaultData = flow(function* () {
    try {
      const result = yield fetch('/collections/vaults');
      const apiVaults: ApiVaultData[] = yield result.json();

      // Clear existing vaults
      self.vaults.clear();

      // Process each vault
      apiVaults.forEach((apiVault) => {
        const { fieldData } = apiVault;

        // Create projects
        const projects = fieldData.projects.map((project) =>
          ProjectModel.create({
            id: project.slug,
            name: project.name,
            description: '', // API doesn't provide description
            logoURL: project['project-logo'].url,
          })
        );

        // Create rewards
        const rewards = fieldData.rewards.map((reward) => {
          console.log(reward);
          return RewardModel.create({
            id: reward.slug,
            name: reward.name,
            isPoints: reward['is-points'],
            pointMultiplier: 1, // Default value since API doesn't provide this
            issuingProject: reward['issuing-project']?.slug || '', // Reference by ID
            token:
              reward['token-address-2']?.['contract-address']?.toLowerCase(),
            // token: model.getTokenByID(
            //   reward['token-address-2']['contract-address'].toLowerCase()
            // ).id as Instance<typeof TokenDefinitionModel>,
          });
        });

        // Create the vault
        const vault = VaultModel.create({
          name: fieldData.name,
          network: fieldData[
            'vault-address-2'
          ].network.name.toLowerCase() as Network,
          depositToken:
            fieldData['deposit-token-2']['contract-address'].toLowerCase(),
          vaultAddress: fieldData['vault-address-2']['contract-address'],
          vaultFeatures: fieldData['vault-features'].map(
            (feature) => feature.name
          ),
          launchedOn: new Date(fieldData['launched-on']),
          strategyType: fieldData['strategy-type-2'].name,
          vaultDescription: fieldData['vault-description'] || '',
          projects,
        });

        vault.setRewards(rewards);
        self.vaults.push(vault);
      });
    } catch (error) {
      console.error('Error fetching vault data:', error);
    }
  });

  const afterAttach = flow(function* () {
    yield refreshVaultData();
  });

  return {
    refreshVaultData,
    afterAttach,
  };
};

export const VaultStoreModel = VaultStore.actions(VaultActions).views(
  (self) => ({
    getVaultByAddress: (vaultAddress: string) => {
      return self.vaults.find((vault) => vault.vaultAddress === vaultAddress);
    },
  })
);

export type VaultStoreType = Instance<typeof VaultStoreModel>;
