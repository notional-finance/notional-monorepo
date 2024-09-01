import { Request, Response } from '@google-cloud/functions-framework';
import DataService from './DataService';
import { calculateAccountRisks, calculatePointsAccrued } from './RiskService';
import { syncDune } from './DuneService';
import { Network, ONE_HOUR_MS } from '@notional-finance/util';
import { logToDataDog, parseQueryParams } from './util';

export default async function (req: Request, res: Response) {
  // check proper header that cannot be set outside of google cloud
  const isCloudScheduler = req.headers['x-cloudscheduler'];
  const authToken = req.headers['x-auth-token'];
  if (isCloudScheduler) {
    console.log('headers', req.headers);
    await logToDataDog('cron-service', req.headers, 'info:cronApp');
  }
  if (
    !isCloudScheduler &&
    (!authToken || authToken !== process.env.DATA_SERVICE_AUTH_TOKEN)
  ) {
    res.status(403).send('Invalid auth token');
    return;
  }

  const dataService = new DataService();
  const queryParams = parseQueryParams(req.query);

  try {
    switch (req.path) {
      case '/calculateRisk':
        await calculateAccountRisks();
        res.status(200).send('OK');
        break;
      case '/calculatePoints':
        await dataService.insertPointsData(
          await calculatePointsAccrued(
            Network.arbitrum,
            queryParams.blockNumber
          )
        );
        res.status(200).send('OK');
        break;
      case '/syncDune':
        await syncDune();
        res.status(200).send('OK');
        break;
      case '/syncAccounts':
        res.send(
          JSON.stringify(await dataService.syncAccounts(queryParams.network))
        );
        break;
      case '/syncVaultAccounts':
        res.send(
          JSON.stringify(
            await dataService.syncVaultAccounts(queryParams.network)
          )
        );
        break;
      case '/syncOracleData':
        res.send(
          JSON.stringify(
            await dataService.syncOracleData(
              dataService.latestTimestamp() - ONE_HOUR_MS / 1000
            )
          )
        );
        break;
      case '/syncGenericData':
        res.send(
          JSON.stringify(
            await dataService.syncGenericData(
              dataService.latestTimestamp() - ONE_HOUR_MS / 1000
            )
          )
        );
        break;

      default:
        res.status(404).send('Not found');
        break;
    }
  } catch (err) {
    console.error(err);
    await logToDataDog(
      'cron-service',
      {
        url: req.url,
        method: req.method,
        message: err?.message,
        stack: err?.stack,
        err: JSON.stringify(err),
        status: 'error',
      },
      'error:cronApp'
    );
    res.status(500).send(JSON.stringify(err));
  }
}
