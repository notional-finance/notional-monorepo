import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import express, { NextFunction, Request, Response } from 'express';
import Knex from 'knex';
import { getEnvSecrets } from 'gae-env-secrets';
import DataService from './DataService';
import {
  AssetType,
  Network,
  ONE_HOUR_MS,
  decodeERC1155Id,
  padToHex256,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { VaultAccount, BackfillType, DataServiceEvent } from './types';
import { calculateAccountRisks, calculatePointsAccrued } from './RiskService';
import { syncDune } from './DuneService';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const port = parseInt(process.env.SERVICE_PORT || '8080');
const app = express();

async function logToDataDog(message: any, ddtags = '') {
  return fetch('https://http-intake.logs.datadoghq.com/api/v2/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'DD-API-KEY': process.env.DD_API_KEY as string,
    },
    body: JSON.stringify({
      ddsource: 'data-service',
      ddtags,
      service: 'data-service',
      message,
    }),
  }).catch((err) => console.error(err));
}

const createUnixSocketPool = () => {
  return Knex({
    client: 'pg',
    pool: {
      max: 200,
    },
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
    },
  });
};

const parseQueryParams = (q) => {
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
  const limit = q.limit ? parseInt(q.limit) : undefined;
  return {
    startTime: startTime,
    endTime: endTime,
    network: network,
    limit: limit,
  };
};

const catchAsync =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

async function main() {
  await getEnvSecrets({ autoDetect: true });
  if (!process.env.DATA_BASE_URL) {
    throw Error('Data URL not defined');
  }

  const db = createUnixSocketPool();
  const dataService = new DataService(db, {
    // TODO: get from env
    blocksPerSecond: {
      [Network.arbitrum]: 2.5, // 2.5 blocks per second on arbitrum
      [Network.mainnet]: 0.083,
    },
    maxProviderRequests: 50,
    interval: 1, // 1 Hour
    frequency: 3600, // Hourly
    dataUrl: process.env.DATA_BASE_URL,
    mergeConflicts: JSON.parse(process.env.MERGE_CONFLICTS || 'false'),
    backfillDelayMs: 5000,
  });

  app.use(express.json());
  app.use(function (req, res, next) {
    if (req.url === '/' || req.url === '/healthz') {
      next();
      return;
    }

    // This header is set by cron jobs
    const isAppEngine = req.headers['x-appengine-cron'] === 'true';
    const authToken = req.headers['x-auth-token'];
    if (
      !isAppEngine &&
      (!authToken || authToken !== process.env.DATA_SERVICE_AUTH_TOKEN)
    ) {
      res.status(403).send('Invalid auth token');
      return;
    }

    next();
  });

  app.get('/', (_, res) => {
    res.send('OK');
  });

  app.get(
    '/blocks',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      const timestamps = dataService.getTimestamps(
        params.startTime,
        params.endTime
      );
      const blockNumbers = await Promise.all(
        timestamps.map((ts) =>
          dataService.getBlockNumberFromTs(params.network, ts)
        )
      );
      res.send(JSON.stringify(blockNumbers));
    })
  );

  app.get(
    '/backfillOracleData',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.OracleData
      );
      res.send('OK');
    })
  );

  app.get(
    '/backfillYieldData',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.YieldData
      );
      res.send('OK');
    })
  );

  app.get(
    '/backfillGenericData',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.GenericData
      );
      res.send('OK');
    })
  );

  app.get(
    '/syncOracleData',
    catchAsync(async (_, res) => {
      res.send(
        JSON.stringify(
          await dataService.syncOracleData(
            dataService.latestTimestamp() - ONE_HOUR_MS / 1000
          )
        )
      );
    })
  );

  app.get(
    '/syncGenericData',
    catchAsync(async (_, res) => {
      res.send(
        JSON.stringify(
          await dataService.syncGenericData(
            dataService.latestTimestamp() - ONE_HOUR_MS / 1000
          )
        )
      );
    })
  );

  app.get(
    '/syncAccounts',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.syncAccounts(params.network)));
    })
  );

  app.get(
    '/syncVaultAccounts',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      res.send(
        JSON.stringify(await dataService.syncVaultAccounts(params.network))
      );
    })
  );

  app.post(
    '/vaultApy',
    catchAsync(async (req, res) => {
      const network: Network = req.body.network;
      await dataService.insertVaultAPY(network, req.body.vaultAPYs);
      res.status(200).send('OK');
    })
  );

  app.post(
    '/events',
    catchAsync(async (req, res) => {
      const network: Network = req.body.network;
      if (!['mainnet', 'arbitrum'].includes(network)) {
        res.status(400).send('Invalid network');
        return;
      }

      let accountIds: string[] = [];
      let vaultAccounts: VaultAccount[] = [];
      req.body.events.forEach((event: DataServiceEvent) => {
        if (event.name === 'AccountContextUpdate') {
          accountIds.push(event.params.account);
        } else if (event.name === 'TransferSingle') {
          const id = BigNumber.from(event.params.id);
          const params = decodeERC1155Id(padToHex256(id));
          if (
            params.assetType === AssetType.VAULT_SHARE_ASSET_TYPE &&
            params.vaultAddress
          ) {
            accountIds.push(event.params.to);
            vaultAccounts.push({
              accountId: event.params.to,
              vaultId: params.vaultAddress,
            });
          }
        } else if (event.name === 'TransferBatch') {
          const ids = event.params.ids.map(BigNumber.from);
          const paramsArray = ids.map((id) => decodeERC1155Id(padToHex256(id)));

          for (const params of paramsArray) {
            if (
              params.assetType === AssetType.VAULT_SHARE_ASSET_TYPE &&
              params.vaultAddress
            ) {
              accountIds.push(event.params.to);
              vaultAccounts.push({
                accountId: event.params.to,
                vaultId: params.vaultAddress,
              });
            }
          }
        }
      });

      accountIds = accountIds.filter((a) => a !== ZERO_ADDRESS);
      if (accountIds.length > 0) {
        await dataService.insertAccounts(network, accountIds);
      }

      vaultAccounts = vaultAccounts.filter(
        (va) => va.accountId !== ZERO_ADDRESS
      );
      if (vaultAccounts.length > 0) {
        await dataService.insertVaultAccounts(network, vaultAccounts);
      }
      res.status(200).send('OK');
    })
  );

  app.get(
    '/accounts',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.accounts(params.network)));
    })
  );

  app.get(
    '/vaultAccounts',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.vaultAccounts(params.network)));
    })
  );

  app.get(
    '/views',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(JSON.stringify(await dataService.views(params.network)));
    })
  );

  app.get(
    '/readiness_check',
    catchAsync(async (_, res) => {
      const isReady = await dataService.readinessCheck();
      if (isReady) {
        res.status(200).send('OK');
      } else {
        res.status(500).send('NOT OK');
      }
    })
  );

  app.get(
    '/healthz',
    catchAsync(async (_, res) => {
      const isReady = await dataService.readinessCheck();
      if (isReady) {
        res.status(200).send('OK');
      } else {
        res.status(500).send('NOT OK');
      }
    })
  );

  app.get(
    '/query',
    catchAsync(async (req, res) => {
      const params = parseQueryParams(req.query);
      const view = req.query.view;
      if (!view) {
        res.status(400).send('View required');
      }

      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(
        JSON.stringify(
          await dataService.getView(
            params.network,
            view as string,
            params.limit
          )
        )
      );
    })
  );

  app.get(
    '/calculateRisk',
    catchAsync(async (_req, res) => {
      await calculateAccountRisks();
      res.status(200).send('OK');
    })
  );

  app.get(
    '/calculatePoints',
    catchAsync(async (req, res) => {
      const blockNumber = req.query.blockNumber
        ? parseInt(req.query.blockNumber as string)
        : undefined;
      dataService.insertPointsData(
        await calculatePointsAccrued(Network.arbitrum, blockNumber)
      );
      res.status(200).send('OK');
    })
  );

  app.get(
    '/syncDune',
    catchAsync(async (_req, res) => {
      await syncDune();
      res.status(200).send('OK');
    })
  );

  app.use(
    async (err: any, req: Request, res: Response, _next: NextFunction) => {
      console.error(err);
      await logToDataDog(
        {
          url: req.url,
          method: req.method,
          message: err?.message,
          stack: err?.stack,
          err: JSON.stringify(err),
          status: 'error',
        },
        'error:express'
      );
      res.status(500).send(JSON.stringify(err));
    }
  );

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
