import { getAccountPoints } from './arb_points';
import { getVaultData, getVaultTVL } from './calculate-points';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Env {}

export default {
  async fetch(
    request: Request,
    _env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const [_, vaultAddress, blockNumber] = url.pathname.split('/', 3);
    if (vaultAddress === 'arb_account_points') {
      return new Response(JSON.stringify(await getAccountPoints(blockNumber)), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Max-Age': '86400',
        },
      });
    } else if (blockNumber === 'tvl') {
      return new Response(JSON.stringify(await getVaultTVL(vaultAddress)));
    } else {
      return new Response(
        JSON.stringify(await getVaultData(vaultAddress, parseInt(blockNumber)))
      );
    }
  },
};
