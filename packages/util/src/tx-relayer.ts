import { Network } from './constants';
import { ethers } from 'ethers';

export const treasuryManagerAddresses: Partial<Record<Network, string>> = {
  arbitrum: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
  mainnet: '0x53144559C0d4a3304e2DD9dAfBD685247429216d',
};

export const managerBotAddresses: Partial<Record<Network, string>> = {
  arbitrum: '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed',
  mainnet: '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed',
};

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
  }).then(async (r) => {
    const returnData = await r.json();

    if (299 < r.status) {
      console.error(returnData);
      throw new Error(returnData.reason || returnData.code || r.statusText);
    }

    return returnData;
  });
}
