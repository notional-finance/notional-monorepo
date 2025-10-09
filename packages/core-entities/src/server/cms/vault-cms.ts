import { Network } from '@notional-finance/util';
import { ApiVaultData, VaultCMSData } from './cms-definition';
import { getEnvVar } from '../../utils/env';

const VAULT_COLLECTION_ID = '68433b8d92fb37321a415b8b';
const WEBFLOW_ROOT = 'https://api-cdn.webflow.com/v2/collections';
const COLLECTION_LIMIT = 100;
const API_TOKEN = getEnvVar('WEBFLOW_API_TOKEN') as string;

interface CollectionDefinition {
  id: string;
  slug: string;
  fields: {
    id: string;
    isEditable: boolean;
    isRequired: boolean;
    type:
      | 'PlainText'
      | 'DateTime'
      | 'Reference'
      | 'MultiReference'
      | 'Option'
      | 'RichText';
    slug: string;
    displayName: string;
    helptext: string | null;
    validations: {
      format?: string;
      maxLength?: number | string;
      collectionId?: string;
      options?: {
        name: string;
        id: string;
      }[];
    };
  }[];
}

interface CollectionItem {
  id: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: Record<string, unknown>;
}

async function getCollectionDefinition(collectionId: string, apiToken: string) {
  const response = await fetch(`${WEBFLOW_ROOT}/${collectionId}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  return (await response.json()) as CollectionDefinition;
}

async function fetchCollectionItems(collectionId: string, apiToken: string) {
  let offset = 0;
  const results: CollectionItem[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const r = await fetch(
      `${WEBFLOW_ROOT}/${collectionId}/items/live?offset=${offset}&limit=${COLLECTION_LIMIT}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const data = (await r.json()) as {
      items: CollectionItem[];
      pagination: {
        offset: number;
        limit: number;
        total: number;
      };
    };

    results.push(...data.items);

    if (data.pagination.total <= data.pagination.offset + COLLECTION_LIMIT) {
      break;
    }

    offset += COLLECTION_LIMIT;
  }

  return results;
}

async function dereferenceCollection(
  collectionDefinition: CollectionDefinition,
  items: CollectionItem[],
  apiToken: string
): Promise<CollectionItem[]> {
  const referenceCollections = await Promise.all(
    collectionDefinition.fields
      .filter(
        (field) => field.type === 'Reference' || field.type === 'MultiReference'
      )
      .map(async (field) => {
        if (!field.validations.collectionId)
          throw Error('No collection id for field ' + field.slug);

        const refDefinition = await getCollectionDefinition(
          field.validations.collectionId,
          apiToken
        );
        const refItems = await fetchCollectionItems(
          field.validations.collectionId,
          apiToken
        );

        return {
          slug: field.slug,
          collectionId: field.validations.collectionId,
          items: await dereferenceCollection(refDefinition, refItems, apiToken),
        };
      })
  );

  const refMap = new Map<string, CollectionItem[]>();
  referenceCollections.forEach((ref) => refMap.set(ref.slug, ref.items));

  // Add options to the refMap, these are not collections but just a list of options
  collectionDefinition.fields
    .filter((field) => field.type === 'Option')
    .forEach((field) => {
      if (!field.validations.options) return;
      refMap.set(
        field.slug,
        field.validations.options.map((o) => {
          return {
            id: o.id,
            isArchived: false,
            isDraft: false,
            fieldData: {
              name: o.name,
            },
          };
        })
      );
    });

  return items.map((item) => {
    return {
      ...item,
      fieldData: Object.fromEntries(
        Object.entries(item.fieldData).map(([key, value]) => {
          return [key, dereferenceField(key, value, refMap)];
        })
      ),
    };
  });
}

function dereferenceField(
  key: string,
  value: unknown,
  referenceCollections: Map<string, CollectionItem[]>
) {
  if (Array.isArray(value)) {
    return value.map((v) => dereferenceField(key, v, referenceCollections));
  }

  const ref = referenceCollections.get(key);
  if (!ref) return value;

  return ref.find((item) => item.id === value)?.fieldData;
}

export async function getVaultCMSData(): Promise<VaultCMSData[]> {
  const definition = await getCollectionDefinition(
    VAULT_COLLECTION_ID,
    API_TOKEN
  );
  const items = await fetchCollectionItems(VAULT_COLLECTION_ID, API_TOKEN);
  const dereferenced = (await dereferenceCollection(
    definition,
    items,
    API_TOKEN
  )) as unknown as ApiVaultData[];

  return dereferenced.map((v) => {
    return {
      name: v.fieldData.name,
      address: v.fieldData['vault-address-2']['contract-address'],
      network: v.fieldData['vault-address-2']['network'][
        'name'
      ].toLowerCase() as Network,
      depositToken: v.fieldData['deposit-token-2']['contract-address'],
      vaultFeatures: v.fieldData['vault-features'].map(
        (feature) => feature.name
      ),
      launchedOn: new Date(v.fieldData['launched-on']).getTime(),
      strategyClass: v.fieldData['strategy-type-2'].name,
      vaultDescription: v.fieldData['vault-description'] || '',
      projects: v.fieldData['projects'].map((p) => ({
        id: p.slug,
        name: p.name,
        logoURL: p['project-logo']?.url,
        description: p['project-description']?.value,
      })),
      rewards:
        v.fieldData['rewards']?.map((r) => ({
          id: r.slug,
          name: r.name,
          token: r['token-address-3']['contract-address'],
        })) || [],
    };
  });
}
