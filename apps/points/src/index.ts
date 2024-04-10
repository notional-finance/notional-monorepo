import { getVaultData } from './calculate-points';

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
    return new Response(
      JSON.stringify(await getVaultData(vaultAddress, parseInt(blockNumber)))
    );
  },
};
