interface Env {
  TX_RELAY_SEND_URL: string,
  TX_RELAY_AUTH_TOKEN: string,
}

export function sendTxThroughRelayer(arg: { env: Env, to: string, data: string }) {
  const { to, data, env } = arg;

  const payload = JSON.stringify({
    to,
    data,
  });
  console.log("sending tx to relayer");
  // cspell:disable-next-line
  return fetch(env.TX_RELAY_SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': env.TX_RELAY_AUTH_TOKEN,
    },
    body: payload,
  });
}

