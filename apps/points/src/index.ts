import { getVaultData, getVaultTVL } from './calculate-points';

export interface Env {
  NX_SUBGRAPH_API_KEY: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const [_, vaultAddress, blockNumber] = url.pathname.split('/', 3);
    if (!vaultAddress || !blockNumber) {
      return new Response('Invalid request', { status: 400 });
    }
    if (blockNumber === 'tvl') {
      const params = new URLSearchParams(url.search);
      const blockNum = params.has('blockNumber')
        ? parseInt(params.get('blockNumber') as string)
        : undefined;

      return new Response(
        JSON.stringify(await getVaultTVL(vaultAddress.toLowerCase(), blockNum))
      );
    } else {
      return new Response(
        JSON.stringify(
          await getVaultData(
            vaultAddress.toLowerCase(),
            parseInt(blockNumber),
            env.NX_SUBGRAPH_API_KEY
          )
        )
      );
    }
  },
};
