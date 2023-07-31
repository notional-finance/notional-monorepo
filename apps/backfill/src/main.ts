import { Network } from '@notional-finance/util';
import {
  HistoricalRegistry,
  AccountFetchMode,
} from '@notional-finance/core-entities';

async function main() {
  console.log('RUN INIT');
  HistoricalRegistry.initialize(
    'http://localhost:3000',
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER
  );

  console.log('START HOST');
  await HistoricalRegistry.startHost('/tmp/registry', 3000);
  console.log('END START HOST');
  const results = await HistoricalRegistry.refreshOverRange(
    'arbitrum' as Network,
    [116477900, 116477800]
  );

  console.log(results);
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
