import { Request, Response } from '@google-cloud/functions-framework';
import { sendTransaction, getAllSignerAddresses } from './Signer';
import { Network } from './types';
import { logToDataDog } from './util';

async function txRelayService(req: Request, res: Response) {
  if (!process.env.AUTH_TOKEN) {
    throw Error('AUTH_TOKEN not defined');
  }
  if (req.path == '/') {
    res.send('OK');
    return;
  }
  if (req.headers['x-auth-token'] !== process.env.AUTH_TOKEN) {
    res.status(401).send('Unauthorized');
    return;
  }

  const log = logToDataDog('tx-relay');

  switch (req.path) {
    case '/v1/signers':
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(await getAllSignerAddresses()));
      break;

    default:
      if (req.path.startsWith('/v1/txes/')) {
        try {
          const network: Network = req.path.split('/')[3] as Network;
          const result = await sendTransaction(
            { ...req.body, network },
            { log }
          );
          res.status(200).send(JSON.stringify(result));
        } catch (e) {
          console.log(e);
          res.status(500).send(JSON.stringify(e));
        }
      } else {
        res.status(404).send('Not Found');
      }
      break;
  }
}

export default txRelayService;
