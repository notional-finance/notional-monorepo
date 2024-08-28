import { Request, Response } from '@google-cloud/functions-framework';
import DataService from './DataService';
import { calculateAccountRisks, calculatePointsAccrued } from './RiskService';
import { syncDune } from './DuneService';
import { Network, ONE_HOUR_MS } from '@notional-finance/util';
import { logToDataDog } from './util';

export default async function (req: Request, res: Response) {
  const dataService = new DataService();

  try {
    switch (req.path) {
      case '/calculateRisk':
        await calculateAccountRisks();
        res.status(200).send('OK');
        break;
      case '/calculatePoints':
        const blockNumber = req.query.blockNumber
          ? parseInt(req.query.blockNumber as string)
          : undefined;
        await dataService.insertPointsData(
          await calculatePointsAccrued(Network.arbitrum, blockNumber)
        );
        res.status(200).send('OK');
        break;
      case '/syncDune':
        await syncDune();
        res.status(200).send('OK');
        break;
      case '/syncAccounts':
        res.send(
          JSON.stringify(
            await dataService.syncAccounts(req.query.network as Network)
          )
        );
        break;
      case '/syncVaultAccounts':
        res.send(
          JSON.stringify(
            await dataService.syncVaultAccounts(req.query.network as Network)
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
