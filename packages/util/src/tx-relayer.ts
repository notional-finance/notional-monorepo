import {Network} from './constants';

interface Env {
  NETWORK: keyof typeof Network;
  TX_RELAY_AUTH_TOKEN: string;
}

const urls: Record<Network,string> = {
  all: '',
 // it has 'arbitrum' in url but it is also endpoint for mainnet relayers,
 // endpoint format is "/v1/txes/:relayerId", relayerId 0 is for arbitrum an 1 for mainnet
  mainnet: 'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/1',
  arbitrum: 'https://tx-relay-arbitrum-dot-monitoring-agents.uc.r.appspot.com/v1/txes/0',
}

export function sendTxThroughRelayer(arg: { env: Env, to: string, data: string }) {
  const { to, data, env } = arg;

  const payload = JSON.stringify({
    to,
    data,
  });

  return fetch(urls[Network[env.NETWORK]], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
}

