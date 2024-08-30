import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getS3 } from './RiskService';

const queries = [
  { queryId: 3709164, name: 'sNOTEPoolData' },
  { queryId: 3709178, name: 'sNOTEReinvestment' },
  { queryId: 3711394, name: 'NOTESupply' },
];

export async function syncDune() {
  const DUNE_API_KEY = process.env['DUNE_API_KEY'] as string;

  for (const q of queries) {
    const { queryId, name } = q;
    const query_result = await fetch(
      `https://api.dune.com/api/v1/query/${queryId}/results`,
      {
        method: 'GET',
        headers: { 'X-DUNE-API-KEY': DUNE_API_KEY },
      }
    );
    await getS3().send(
      new PutObjectCommand({
        Bucket: 'view-cache-r2',
        Key: `mainnet/note/${name}`,
        Body: JSON.stringify(await query_result.json()),
      })
    );
  }
}
