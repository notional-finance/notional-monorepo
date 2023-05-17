const crossFetch = require('cross-fetch');
const fs = require('fs');

async function main() {
  const apiHostname = 'http://localhost:8787';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const c = await crossFetch(
    `${apiHostname}/configuration?network=arbitrum`
  ).then((r) => r.text());

  const t = await crossFetch(`${apiHostname}/tokens?network=arbitrum`).then(
    (r) => r.text()
  );

  const e = await crossFetch(`${apiHostname}/exchanges?network=arbitrum`).then(
    (r) => r.text()
  );

  const o = await crossFetch(`${apiHostname}/oracles?network=arbitrum`).then(
    (r) => r.text()
  );

  fs.writeFileSync(`${__dirname}/clients/__snapshots__/configuration`, c);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/tokens`, t);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/exchanges`, e);
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/oracles`, o);
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
