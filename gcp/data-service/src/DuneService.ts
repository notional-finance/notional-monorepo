import { PutObjectCommand } from '@aws-sdk/client-s3';
import { DuneClient } from '@duneanalytics/client-sdk';
import { S3 } from './RiskService';

const DUNE_API_KEY = process.env['DUNE_API_KEY'] as string;
const dune = new DuneClient(DUNE_API_KEY);
const queries = [
  { queryId: 3709164, name: 'sNOTEPoolData' },
  { queryId: 3709178, name: 'sNOTEReinvestment' },
];

export async function syncDune() {
  await Promise.all(
    queries.map(async ({ queryId, name }) => {
      const query_result = await dune.runQuery({ queryId });
      await S3.send(
        new PutObjectCommand({
          Bucket: 'account-cache-r2',
          Key: `mainnet/note/${name}`,
          Body: JSON.stringify(query_result),
        })
      );
    })
  );
}
