import { Network } from './constants';

export const treasuryManagerAddresses: Partial<Record<Network, string>> = {
  arbitrum: '0x53144559c0d4a3304e2dd9dafbd685247429216d',
  mainnet: '0x53144559c0d4a3304e2dd9dafbd685247429216d',
};

export const managerBotAddresses: Partial<Record<Network, string>> = {
  arbitrum: '0x745915418D8B70f39ce9e61A965cBB0C87f9f7Ed',
  mainnet: '0x3164400d0c849996efCb390ec1D4705f2cD5E98C',
};

interface Env {
  NETWORK: Network;
  TX_RELAY_AUTH_TOKEN: string;
}

const MAINNET_LIQUIDATOR_RELAY =
  'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/2';

const urls: Record<Network, string> = {
  [Network.all]: '',
  // it has 'arbitrum' in url but it is also endpoint for mainnet relayers,
  // endpoint format is "/v1/txes/:relayerId", relayerId 0 is for arbitrum an 1 for mainnet
  [Network.mainnet]:
    'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/1',
  [Network.arbitrum]:
    'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/0',
  [Network.optimism]: '',
};

export function sendTxThroughRelayer(arg: {
  env: Env;
  to: string;
  data: string;
  isLiquidator?: boolean;
}) {
  const { to, data, env, isLiquidator } = arg;

  const payload = JSON.stringify({
    to,
    data,
  });
  let url = urls[env.NETWORK];
  if (isLiquidator && env.NETWORK === Network.mainnet) {
    url = MAINNET_LIQUIDATOR_RELAY;
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
}
