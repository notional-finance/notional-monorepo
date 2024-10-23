import { Network } from './constants';
import { ethers } from 'ethers';

interface Env {
  NETWORK: Network;
  TX_RELAY_AUTH_TOKEN: string;
  RPC_URL?: string; // custom RPC url can only be used for testing when chain id of forked network is 111111, check is enforced by relayer on backend
}

export async function sendTxThroughRelayer(arg: {
  env: Env;
  to: string;
  data: string;
  gasLimit?: number;
}): Promise<ethers.providers.TransactionResponse> {
  const { to, data, env, gasLimit } = arg;

  const payload = JSON.stringify({
    to,
    data,
    gasLimit,
    rpcUrl: env.RPC_URL,
  });

  const url = `https://us-central1-monitoring-agents.cloudfunctions.net/tx-relay/v1/txes/${env.NETWORK}`;
  console.log(`Sending Payload to ${url}`);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  }).then(async (r: Response) => {
    const returnData = (await r.json()) as {
      reason?: string;
      code?: string;
    } & ethers.providers.TransactionResponse;

    if (299 < r.status) {
      console.error(returnData);
      throw new Error(
        returnData['reason'] || returnData['code'] || r.statusText
      );
    }

    return returnData as ethers.providers.TransactionResponse;
  });
}
