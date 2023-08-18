import * as path from 'path';
import {
  Network,
  // ZERO_ADDRESS,
  ORACLE_TYPE_TO_ID,
} from '@notional-finance/util';
import fs from 'fs';
import { AccountFetchMode } from '@notional-finance/core-entities';
import { HistoricalRegistry } from './HistoricalRegistry';
import blockRange from './blockRange.json';
import Knex from 'knex';

/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const network = Network.ArbitrumOne;
const mergeConflicts = JSON.parse(process.env.MERGE_CONFLICTS || 'false');

const networkToId = {
  mainnet: 1,
  arbitrum: 2,
};

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

function getYieldData(network: Network, block: number) {
  const yields = HistoricalRegistry.getYieldRegistry();
  const yieldData = yields.getAllYields(network);
  return yieldData.map((y) => {
    return {
      block_number: block,
      network_id: networkToId[network],
      token: y.token.id,
      total_value_locked: y.tvl.toExactString(),
      underlying: y.tvl.tokenId,
      total_apy: y.totalAPY,
      interest_apy: y.interestAPY,
      fee_apy: y.feeAPY,
      note_incentives:
        y.incentives?.length > 0 ? y.incentives[0].incentiveAPY : undefined,
      leverage: y.leveraged?.leverageRatio,
      max_leverage: y.leveraged?.maxLeverageRatio,
      debt_token: y.leveraged ? y.leveraged.debtToken.id : '',
      debt_rate: y.leveraged?.debtRate,
    };
  });
}

function getOracleData(network: Network) {
  const oracle = HistoricalRegistry.getOracleRegistry();
  const allOracles = oracle.getLatestFromAllSubjects(network, 0);

  return Array.from(allOracles.values()).map((o) => {
    const oracleId = ORACLE_TYPE_TO_ID[o.oracleType];
    if (!oracleId) {
      throw Error(`Unknown oracle ${o.oracleType}`);
    }

    return {
      base: o.base,
      quote: o.quote,
      oracle_type: oracleId,
      network: networkToId[network],
      block_number: o.latestRate.blockNumber,
      timestamp: o.latestRate.timestamp,
      decimals: o.decimals,
      oracle_address: o.oracleAddress,
      latest_rate: o.latestRate.rate.toString(),
    };
  });
}

async function main() {
  HistoricalRegistry.initialize(
    'http://localhost:3000',
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER
  );

  await HistoricalRegistry.startHost('apps/backfill/assets', 3000);
  const yieldResults: ReturnType<typeof getYieldData>[] = [];
  const oracleResults: ReturnType<typeof getOracleData>[] = [];
  const db = createUnixSocketPool();

  for (const block of blockRange) {
    await HistoricalRegistry.refreshAtBlock(network, block);
    console.log(`Refreshed data at ${block}`);
    const yieldData = getYieldData(network, block);
    const oracleData = getOracleData(network);

    const yieldDataFlat = yieldData.flatMap((_) => _);
    if (yieldDataFlat.length > 0) {
      const yieldQuery = db
        .insert(yieldDataFlat)
        .into('yield_data')
        .onConflict([
          'token',
          'underlying',
          'debt_token',
          'network_id',
          'block_number',
        ]);

      if (mergeConflicts) {
        await yieldQuery.merge();
      } else {
        await yieldQuery.ignore();
      }
    }

    const oracleDataFlat = oracleData.flatMap((_) => _);
    if (oracleDataFlat.length > 0) {
      const oracleQuery = db
        .insert(oracleDataFlat)
        .into('oracle_data')
        .onConflict(['base', 'quote', 'oracle_type', 'network', 'timestamp']);

      if (mergeConflicts) {
        await oracleQuery.merge();
      } else {
        await oracleQuery.ignore();
      }
    }

    yieldResults.push(yieldData);
    oracleResults.push(oracleData);
  }

  fs.writeFileSync(
    `apps/backfill/yields.json`,
    JSON.stringify(yieldResults.flatMap((_) => _))
  );

  fs.writeFileSync(
    `apps/backfill/oracles.json`,
    JSON.stringify(oracleResults.flatMap((_) => _))
  );
  console.log('[DONE] Wrote to files');
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
