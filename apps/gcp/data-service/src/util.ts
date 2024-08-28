import { Request } from '@google-cloud/functions-framework';
import { Network } from '@notional-finance/util';

export async function logToDataDog(
  service: string,
  message: Record<string, unknown>,
  ddtags = ''
) {
  return fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'DD-API-KEY': process.env.DD_API_KEY as string,
    },
    body: JSON.stringify({
      ddsource: service,
      ddtags,
      service,
      message,
    }),
  }).catch((err) => console.error(err));
}

export const parseQueryParams = (q: Request['query']) => {
  const now = Date.now() / 1000;
  let startTime = now;
  if (q.startTime) {
    startTime = parseInt(q.startTime as string);
    if (startTime > now) {
      startTime = now;
    }
  }
  let endTime = now;
  if (q.endTime) {
    endTime = parseInt(q.endTime as string);
    if (endTime > now) {
      endTime = now;
    }
  }
  if (endTime < startTime) {
    throw Error('endTime must be greater than startTime');
  }
  const network = q.network ? (q.network as Network) : Network.mainnet;
  const limit = q.limit ? parseInt(q.limit as string) : undefined;
  const blockNumber = q.blockNumber
    ? parseInt(q.blockNumber as string)
    : undefined;

  return {
    startTime: startTime,
    endTime: endTime,
    network: network,
    limit: limit,
    blockNumber: blockNumber,
  };
};
