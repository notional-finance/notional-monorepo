import { Network } from '@notional-finance/util';
import {
  HistoricalRegistry,
  AccountFetchMode,
} from '@notional-finance/core-entities';

async function main() {
  HistoricalRegistry.initialize(
    'http://localhost:3000',
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER
  );

  await HistoricalRegistry.startHost('apps/backfill/assets', 3000);
  // await new Promise((resolve) => setTimeout(resolve, 100000));
  const results = await HistoricalRegistry.refreshOverRange(
    Network.ArbitrumOne,
    [116477900, 116477800]
  );

  console.log('RESULTS', results);
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
