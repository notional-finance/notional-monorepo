const crossFetch = require('cross-fetch');
const fs = require('fs');

const blockNumber = 157125800;
// This always refers to a mainnet block
const allBlock = 18720490;

async function main() {
  // Serve the data worker in order to run the requests
  const apiHostname = 'http://localhost:8787';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const c = await crossFetch(
    `${apiHostname}/arbitrum/configuration/${blockNumber}`
  ).then((r) => r.text());

  const t = await crossFetch(
    `${apiHostname}/arbitrum/tokens/${blockNumber}`
  ).then((r) => r.text());

  const e = await crossFetch(
    `${apiHostname}/arbitrum/exchanges/${blockNumber}`
  ).then((r) => r.text());

  const o = await crossFetch(
    `${apiHostname}/arbitrum/oracles/${blockNumber}`
  ).then((r) => r.text());

  const v = await crossFetch(
    `${apiHostname}/arbitrum/vaults/${blockNumber}`
  ).then((r) => r.text());

  // const a = await crossFetch(`${apiHostname}/arbitrum/accounts/${blockNumber}`).then((r) =>
  //   r.text()
  // );

  const allTokens = await crossFetch(
    `${apiHostname}/all/tokens/${allBlock}`
  ).then((r) => r.text());
  const allOracles = await crossFetch(
    `${apiHostname}/all/oracles/${allBlock}`
  ).then((r) => r.text());

  fs.writeFileSync(
    `${__dirname}/clients/__snapshots__/arbitrum/configuration`,
    c
  );
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/tokens`, t);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/exchanges`, e);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/oracles`, o);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/vaults`, v);
  // fs.writeFileSync(`${__dirname}/clients/__snapshots__/arbitrum/accounts`, a);
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
