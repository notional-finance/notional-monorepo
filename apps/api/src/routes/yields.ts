import { Request as CFRequest } from '@cloudflare/workers-types';
import { IRequest } from 'itty-router';
import { APIEnv } from '..';

export function handleYields(request: IRequest, env: APIEnv) {
  const id = env.YIELDS_DO.idFromName(env.YIELDS_NAME);
  const stub = env.YIELDS_DO.get(id);
  return stub.fetch(request as unknown as CFRequest);
}
