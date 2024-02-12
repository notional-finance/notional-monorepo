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
  getProviderFromNetwork,
  padToHex256,
} from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { VaultAccount, BackfillType } from './types';

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
  const network = q.network ? (q.network as Network) : Network.Mainnet;
  const limit = q.limit ? parseInt(q.limit) : undefined;
  return {
    startTime: startTime,
    endTime: endTime,
    network: network,
    limit: limit,
  };
};

async function main() {
  if (!process.env.NETWORK) {
    throw Error('Network not defined');
  }
  if (!process.env.REGISTRY_BASE_URL) {
    throw Error('Registry URL not defined');
  }
  if (!process.env.DATA_BASE_URL) {
    throw Error('Data URL not defined');
  }

  const db = createUnixSocketPool();
  const provider = getProviderFromNetwork(Network[process.env.NETWORK], true);
  const dataService = new DataService(provider, db, {
    network: Network[process.env.NETWORK],
    // TODO: get from env
    blocksPerSecond: {
      [Network.ArbitrumOne]: 2.5, // 2.5 blocks per second on arbitrum
      [Network.Mainnet]: 0.083,
    },
    maxProviderRequests: 50,
    interval: 1, // 1 Hour
    frequency: 3600, // Hourly
    startingBlock: 86540848, // Oldest block in the subgraph
    registryUrl: process.env.REGISTRY_BASE_URL,
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

  app.get('/syncYieldData', async (_, res) => {
    try {
      res.send(
        JSON.stringify(
          await dataService.syncYieldData(
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

  app.post('/events', async (req, res) => {
    try {
      const accountIds: string[] = [];
      const vaultAccounts: VaultAccount[] = [];

      req.body.events.forEach((event: any) => {
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
        }
      });

      if (accountIds.length > 0) {
        await dataService.insertAccounts(Network.ArbitrumOne, accountIds);
      }
      if (vaultAccounts.length > 0) {
        await dataService.insertVaultAccounts(
          Network.ArbitrumOne,
          vaultAccounts
        );
      }
      res.status(200).send('OK');
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/accounts', async (_, res) => {
    try {
      res.send(JSON.stringify(await dataService.accounts()));
    } catch (e: any) {
      res.status(500).send(e.toString());
    }
  });

  app.get('/vaultAccounts', async (_, res) => {
    try {
      res.send(JSON.stringify(await dataService.vaultAccounts()));
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

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
