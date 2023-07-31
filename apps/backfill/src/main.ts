import { Network } from '@notional-finance/util';
import fs from 'fs';
import {
  HistoricalRegistry,
  AccountFetchMode,
} from '@notional-finance/core-entities';

const blockRange = [116477900, 116477800];
const network = Network.ArbitrumOne;

function getYieldData(network: Network, block: number) {
  const yields = HistoricalRegistry.getYieldRegistry();
  return yields.getAllYields(network).map((y) => {
    return {
      block_number: block,
      network,
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
      debt_token: y.leveraged?.debtToken.id,
      debt_rate: y.leveraged?.debtRate,
    };
  });
}

function getOracleData(network: Network) {
  const oracle = HistoricalRegistry.getOracleRegistry();
  const allOracles = oracle.getLatestFromAllSubjects(network, 0);

  return Array.from(allOracles.values()).map((o) => {
    return {
      quote: o.quote,
      oracle_type: o.oracleType,
      network,
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

  for (const block of blockRange) {
    await HistoricalRegistry.refreshAtBlock(network, block);
    console.log(`Refreshed data at ${block}`);
    yieldResults.push(getYieldData(network, block));
    oracleResults.push(getOracleData(network));
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
