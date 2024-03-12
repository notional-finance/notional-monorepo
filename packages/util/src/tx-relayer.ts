import { Network } from './constants';

interface Env {
  NETWORK: Network;
  TX_RELAY_AUTH_TOKEN: string;
}

const MAINNET_LIQUIDATOR_RELAY =
  'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/2';

const urls: Record<Network, string> = {
  [Network.All]: '',
  // it has 'arbitrum' in url but it is also endpoint for mainnet relayers,
  // endpoint format is "/v1/txes/:relayerId", relayerId 0 is for arbitrum an 1 for mainnet
  [Network.Mainnet]:
    'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/1',
  [Network.ArbitrumOne]:
    'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/0',
  [Network.Optimism]: '',
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
  if (isLiquidator && env.NETWORK === Network.Mainnet) {
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
