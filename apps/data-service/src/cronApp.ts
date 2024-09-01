import { Request, Response } from '@google-cloud/functions-framework';
import DataService from './DataService';
import { calculateAccountRisks, calculatePointsAccrued } from './RiskService';
import { syncDune } from './DuneService';
import { Network, ONE_HOUR_MS } from '@notional-finance/util';
import { logToDataDog, parseQueryParams } from './util';

export default async function (req: Request, res: Response) {
  // no custom authentication/authorization needed since cron service
  // will be only triggered by google cloud scheduler with the proper service account
  // that has the necessary permissions and is not meant to be accessed from outside of google cloud

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
