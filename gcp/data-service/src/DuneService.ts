import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from './RiskService';
import fetch from 'cross-fetch';

const DUNE_API_KEY = process.env['DUNE_API_KEY'] as string;
const queries = [
  { queryId: 3709164, name: 'sNOTEPoolData' },
  { queryId: 3709178, name: 'sNOTEReinvestment' },
];

export async function syncDune() {
  for (const q of queries) {
    const { queryId, name } = q;
    const query_result = await fetch(
      `https://api.dune.com/api/v1/query/${queryId}/results`,
      {
        method: 'GET',
        headers: { 'X-DUNE-API-KEY': DUNE_API_KEY },
      }
    );
    await S3.send(
      new PutObjectCommand({
        Bucket: 'account-cache-r2',
        Key: `mainnet/note/${name}`,
        Body: JSON.stringify(await query_result.json()),
      })
    );
  }
}
