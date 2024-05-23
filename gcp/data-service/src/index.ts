import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import express from 'express';
import Knex from 'knex';
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

const createUnixSocketPool = () => {
  return Knex({
    client: 'pg',
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

async function main() {
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
    if (req.url === '/') {
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

  app.get('/blocks', async (req, res) => {
    try {
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
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/backfillOracleData', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.OracleData
      );
      res.send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/backfillYieldData', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.YieldData
      );
      res.send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/backfillGenericData', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      await dataService.backfill(
        params.startTime,
        params.endTime,
        BackfillType.GenericData
      );
      res.send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/syncOracleData', async (_, res) => {
    try {
      res.send(
        JSON.stringify(
          await dataService.syncOracleData(
            dataService.latestTimestamp() - ONE_HOUR_MS / 1000
          )
        )
      );
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/syncGenericData', async (_, res) => {
    try {
      res.send(
        JSON.stringify(
          await dataService.syncGenericData(
            dataService.latestTimestamp() - ONE_HOUR_MS / 1000
          )
        )
      );
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/syncAccounts', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      res.send(
        JSON.stringify(await dataService.syncAccounts(params.network, false))
      );
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/syncVaultAccounts', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      res.send(
        JSON.stringify(await dataService.syncAccounts(params.network, true))
      );
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.post('/vaultApy', async (req, res) => {
    try {
      const network: Network = req.body.network;

      await dataService.insertVaultAPY(network, req.body.vaultAPYs);
      res.status(200).send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.post('/events', async (req, res) => {
    try {
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
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/accounts', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.accounts(params.network)));
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/vaultAccounts', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.vaultAccounts(params.network)));
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/views', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      res.send(JSON.stringify(await dataService.views(params.network)));
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/query', async (req, res) => {
    try {
      const params = parseQueryParams(req.query);
      const view = req.query.view;
      if (!view) {
        res.status(400).send('View required');
      }
      res.send(
        JSON.stringify(
          await dataService.getView(
            params.network,
            view as string,
            params.limit
          )
        )
      );
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/calculateRisk', async (_req, res) => {
    try {
      await calculateAccountRisks();
      res.status(200).send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/calculatePoints', async (_req, res) => {
    try {
      dataService.insertPointsData(
        await calculatePointsAccrued(Network.arbitrum)
      );
      res.status(200).send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/syncDune', async (_req, res) => {
    try {
      await syncDune();
      res.status(200).send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
