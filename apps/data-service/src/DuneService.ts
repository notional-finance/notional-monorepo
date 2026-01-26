import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID'] as string;
const queries = [
  { queryId: 3709164, name: 'sNOTEPoolData' },
  { queryId: 3709178, name: 'sNOTEReinvestment' },
  { queryId: 3711394, name: 'NOTESupply' },
];

let cachedS3Client: S3Client;
export function getS3() {
  const R2_ACCESS_KEY_ID = process.env['R2_ACCESS_KEY_ID'] as string;
  const R2_SECRET_ACCESS_KEY = process.env['R2_SECRET_ACCESS_KEY'] as string;

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedS3Client;
}

export async function syncDune() {
  const DUNE_API_KEY = process.env['DUNE_API_KEY'] as string;

  for (const q of queries) {
    const { queryId, name } = q;
    const execute_result = await fetch(
      `https://api.dune.com/api/v1/query/${queryId}/execute`,
      {
        method: 'POST',
        headers: { 'X-DUNE-API-KEY': DUNE_API_KEY },
      }
    );
    const execution_result = await execute_result.json();
    console.log(
      `Query ${queryId} Execution ID: ${JSON.stringify(execution_result)}`
    );
    const execution_id = execution_result['execution_id'];

    // Wait for the execution to complete
    let attempts = 0;
    while (attempts < 10) {
      const execution_result = await fetch(
        `https://api.dune.com/api/v1/execution/${execution_id}/status`,
        {
          headers: { 'X-DUNE-API-KEY': DUNE_API_KEY },
        }
      );
      const execution_result_json = await execution_result.json();
      console.log(
        `Query ${queryId} Execution Finished: ${JSON.stringify(
          execution_result_json
        )}`
      );
      if (execution_result_json['is_execution_finished']) break;

      await new Promise((resolve) => setTimeout(resolve, 10_000));
      attempts++;
    }

    const get_result = await fetch(
      `https://api.dune.com/api/v1/execution/${execution_id}/results`,
      {
        method: 'GET',
        headers: { 'X-DUNE-API-KEY': DUNE_API_KEY },
      }
    );
    console.log(`Query ${queryId} Get Result: ${get_result.status}`);
    if (get_result.status === 200) {
      await getS3().send(
        new PutObjectCommand({
          Bucket: 'view-cache-r2',
          Key: `mainnet/note/${name}`,
          ContentType: 'application/json',
          Body: JSON.stringify(await get_result.json()),
        })
      );
    } else {
      return false;
    }
  }
}
