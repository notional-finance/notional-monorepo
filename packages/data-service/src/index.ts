import * as path from 'path';
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import express from 'express';
import axios from 'axios';
import Knex from 'knex';
import DataService from './DataService';
import { Network, getProviderFromNetwork } from '@notional-finance/util';
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

export const getRegistryData = async (type, network) => {
  const baseUrl = process.env.REGISTRY_BASE_URL;
  const resp = await axios.get(`${baseUrl}/${type}`, {
    params: {
      network: network,
    },
  });
  return resp.data.values;
};

// TODO: fetch from DB
const networkToId = {
  mainnet: 1,
  arbitrum: 2,
};

// TODO: fetch from DB
const oracleTypeToId = {
  Chainlink: 1,
  VaultShareOracleRate: 2,
  fCashOracleRate: 3,
  nTokenToUnderlyingExchangeRate: 4,
  fCashToUnderlyingExchangeRate: 5,
  fCashSettlementRate: 6,
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

async function main() {
  if (!process.env.NETWORK) {
    throw Error('Network not defined');
  }

  const db = createUnixSocketPool();
  const provider = getProviderFromNetwork(Network[process.env.NETWORK]);
  const dataService = new DataService(provider, db, {
    // TODO: get from env
    blocksPerSecond: 2.5, // 2.5 blocks per second on arbitrum
    maxProviderRequests: 50,
    interval: 1, // 1 Hour
    frequency: 3600, // Hourly
  });

  app.get('/', (_, res) => {
    res.send('OK');
  });

  app.get('/block', async (req, res) => {
    const blockNum = parseInt((req.query.number as string) || '0');
    console.log(`blockNum=${blockNum}`);
    const block = await provider.getBlock(blockNum);
    res.send(JSON.stringify(block));
  });

  app.get('/time', async (req, res) => {
    const targetTimestamp = parseInt(
      (req.query.targetTimestamp as string) || '0'
    );
    const block = await dataService.getBlockNumberByTimestamp(targetTimestamp);
    res.send(JSON.stringify(block));
  });

  app.get('/backfill', async (req, res) => {
    const startTime = parseInt((req.query.startTime as string) || '0');
    let endTime = Date.now() / 1000;
    if (req.query.endTime) {
      endTime = parseInt(req.query.endTime as string);
    }
    if (endTime < startTime) {
      res.status(400).send('endTime must be greater than startTime');
      return;
    }
    await dataService.backfill(startTime, endTime);
    res.send('OK');
  });

  app.get('/sync', async (_, res) => {
    try {
      //const data = await getRegistryData('oracles', 'arbitrum');
      /*for (let i = 0; i < data.length; i++) {
        const value = data[i][1];
        console.log(
          `INSERT INTO oracle_data (base, quote, oracle_type, network, timestamp, block_number, decimals, oracle_address, latest_rate)`
        );
        console.log(
          `VALUES ('${value.base}','${value.quote}',${oracleTypeToId[value.oracleType]},${
            networkToId[value.network]
          },to_timestamp(${value.latestRate.timestamp}),${value.latestRate.blockNumber},${value.decimals},'${
            value.oracleAddress
          }','${JSON.stringify(value.latestRate)}')`
        );
      }*/
      //res.send(JSON.stringify(dataService.sync(dataService.latestTimestamp())));
      res.send(
        JSON.stringify(await dataService.sync(dataService.latestTimestamp()))
      );
    } catch (e) {
      console.log(e);
    }
  });

  app.get('/data/oracles', async (_, res) => {
    try {
      const results = await db.select().from('oracle_data');
      const data = {
        base: results[0].base,
        quote: results[0].quote,
        oracleType: getKeyByValue(oracleTypeToId, results[0].oracle_type),
        network: getKeyByValue(networkToId, results[0].network),
        decimals: results[0].decimals,
        oracleAddress: results[0].oracle_address,
        series: results.map((r) => ({
          timestamp: Date.parse(r.timestamp),
          blockNumber: r.block_number,
          rate: JSON.parse(r.latest_rate),
        })),
      };
      res.send(JSON.stringify(data));
    } catch (e) {
      console.log(e);
    }
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main();
