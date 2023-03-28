import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { APIEnv } from '..';

export function handleKPIs(request: IRequest, env: APIEnv) {
  const id = env.KPIS_DO.idFromName(env.KPIS_NAME);
  const stub = env.KPIS_DO.get(id);
  return stub.fetch(request as unknown as CFRequest);
}
