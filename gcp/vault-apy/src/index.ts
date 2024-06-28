import { Network } from './types';
import configPerNetwork from './config';
import { execPromise } from './util';
import APYSimulator from './APYSimulator';

const log = require('debug')('vault-apy');

process.on('exit', async function () {
  // cleanup
  await execPromise('pkill anvil').finally(() => null);
});

(async function () {
  const info = `
    run without arguments for daily calculation for all vaults
    run with historical as first argument for calculations for the last 7 days for all vaults
    run with historical as first argument, network second and vault address as third to only calculate for single vault

    run with env DEBUG variable set to vault-apy to get detailed logs
  `;
  const networks = Object.keys(configPerNetwork) as Network[];
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  if (process.argv.length == 2) {
    for (const network of networks) {
      log(`processing daily network ${network}`);

      const apySimulator = new APYSimulator(network);
      await apySimulator.run();

      log('processing completed');
    }
  } else if (
    process.argv[2].toLowerCase() == 'historical' &&
    process.argv.length == 3
  ) {
    for (const network of networks) {
      const apySimulator = new APYSimulator(network);
      log(
        `processing historical apy network ${network} on date ${startOfToday.toISOString()}`
      );

      await apySimulator.runHistorical(90, startOfToday);

      log('processing completed');
    }
  } else if (
    process.argv[2].toLowerCase() == 'historical' &&
    process.argv.length == 5
  ) {
    const [, , , network, vaultAddress] = process.argv;
    if (!configPerNetwork[network]) {
      throw new Error('Invalid network name');
    }
    if (
      !configPerNetwork[network as Network].vaults.find(
        (v) => v.address.toLowerCase() === vaultAddress.toLowerCase()
      )
    ) {
      throw new Error(
        `Vault address ${vaultAddress} does not exist in config file`
      );
    }

    log(
      `processing historical apy for vault: ${vaultAddress} on network ${network}`
    );

    const apySimulator = new APYSimulator(network as Network);
    await apySimulator.runHistoricalForVault(vaultAddress, 30, startOfToday);

    log('processing completed');
  } else {
    console.log('Invalid arguments');
    console.log(info);
  }
})().then(() => process.exit());
