import { APIEnv } from '@notional-finance/durable-objects';
import { IRequest } from 'itty-router';

export const handleHealthcheck = (request: IRequest, env: APIEnv) => {
  const hostname = new URL(request.url).hostname;
  // TODO: check all analytics tables

  env.SUPPORTED_NETWORKS.flatMap((network) => {
    return [
      fetch(`${hostname}/${network}/tokens`),
      fetch(`${hostname}/${network}/configuration`),
      fetch(`${hostname}/${network}/oracles`),
      fetch(`${hostname}/${network}/exchanges`),
      fetch(`${hostname}/${network}/vaults`),
    ];
  });
};
