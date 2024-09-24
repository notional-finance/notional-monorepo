import express, { NextFunction, Request, Response, Handler } from 'express';
import DataService from './DataService';
import {
  AssetType,
  Network,
  decodeERC1155Id,
  padToHex256,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { VaultAccount, BackfillType, DataServiceEvent } from './types';
import { logToDataDog, parseQueryParams } from './util';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const app = express();

const catchAsync =
  (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

const dataService = new DataService();

app.use(function (req, res, next) {
  if (req.url === '/' || req.url === '/healthz') {
    next();
    return;
  }

  // This header is set by cron jobs
  const authToken = req.headers['x-auth-token'];
  if (!authToken || authToken !== process.env.DATA_SERVICE_AUTH_TOKEN) {
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
        dataService.getBlockNumberFromTs(params.network as Network, ts)
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
    await dataService.backfill(
      parseInt(req.query.startTime as string),
      parseInt(req.query.endTime as string),
      BackfillType.GenericData
    );
    res.send('OK');
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
  '/reinvestmentTrades',
  catchAsync(async (req, res) => {
    const network: Network = req.body.network;
    await dataService.insertReinvestmentTrades(
      network,
      req.body.reinvestmentTrades
    );
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

    vaultAccounts = vaultAccounts.filter((va) => va.accountId !== ZERO_ADDRESS);
    if (vaultAccounts.length > 0) {
      await dataService.insertVaultAccounts(network, vaultAccounts);
    }
    res.status(200).send('OK');
  })
);

app.get(
  '/accounts',
  catchAsync(async (req, res) => {
    res.send(
      JSON.stringify(
        await dataService.accounts(parseQueryParams(req.query).network)
      )
    );
  })
);

app.get(
  '/vaultAccounts',
  catchAsync(async (req, res) => {
    res.send(
      JSON.stringify(
        await dataService.vaultAccounts(parseQueryParams(req.query).network)
      )
    );
  })
);

app.get(
  '/views',
  catchAsync(async (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(
      JSON.stringify(
        await dataService.views(parseQueryParams(req.query).network)
      )
    );
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
        await dataService.getView(params.network, view as string, params.limit)
      )
    );
  })
);

app.use(
  async (err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    await logToDataDog(
      'data-service',
      {
        url: req.url,
        method: req.method,
        message: err?.message,
        stack: err?.stack,
        err: JSON.stringify(err),
        status: 'error',
      },
      'error:dataApp'
    );
    res.status(500).send(JSON.stringify(err));
  }
);

export default app;
