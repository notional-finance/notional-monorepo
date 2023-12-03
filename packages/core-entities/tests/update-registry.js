const crossFetch = require('cross-fetch');
const fs = require('fs');

async function main() {
  const apiHostname = 'https://data-dev.notional.finance';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const c = await crossFetch(`${apiHostname}/arbitrum/configuration`).then(
    (r) => r.text()
  );

  const t = await crossFetch(`${apiHostname}/arbitrum/tokens`).then((r) =>
    r.text()
  );

  const e = await crossFetch(`${apiHostname}/arbitrum/exchanges`).then((r) =>
    r.text()
  );

  const o = await crossFetch(`${apiHostname}/arbitrum/oracles`).then((r) =>
    r.text()
  );

  const v = await crossFetch(`${apiHostname}/arbitrum/vaults`).then((r) =>
    r.text()
  );

  const a = await crossFetch(`${apiHostname}/arbitrum/accounts`).then((r) =>
    r.text()
  );

  const allTokens = await crossFetch(`${apiHostname}/all/tokens`).then((r) =>
    r.text()
  );
  const allOracles = await crossFetch(`${apiHostname}/all/oracles`).then((r) =>
    r.text()
  );

  fs.writeFileSync(
    `${__dirname}/clients/__snapshots__/arbitrum/configuration`,
    c
  );
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/tokens`, t);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/exchanges`, e);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/oracles`, o);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/vaults`, v);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/accounts`, a);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/all/tokens`, allTokens);
  fs.writeFileSync(
    `${__dirname}/clients/__snapshots__/all/oracles`,
    allOracles
  );
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
