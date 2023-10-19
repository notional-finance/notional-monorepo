const crossFetch = require('cross-fetch');
const fs = require('fs');

async function main() {
  const apiHostname = 'http://127.0.0.1:8787';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const c = await crossFetch(`${apiHostname}/arbitrum/configuration`).then(
    (r) => r.text()
  );

  const t = await crossFetch(`${apiHostname}/arbitrum/tokens`).then((r) =>
    r.text()
  );

  const e = await crossFetch(`http://127.0.0.1:56132/arbitrum/exchanges`).then(
    (r) => r.text()
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

  const views = [
    'historical_oracle_values',
    'notional_asset_historical_prices',
    'notional_assets_apys_and_tvls',
    '0xb6efe4f505248846465f944801e299c14269126b',
    '0xb9bdaa34ea52c3e2f3ec39fcd8146887e6b1c78c',
    '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
  ];

  viewData = await Promise.all(
    views.map((v) =>
      crossFetch(`${apiHostname}/arbitrum/views/${v}`).then((r) => r.text())
    )
  );

  const allViews = ['historical_oracle_values'];

  allViewData = await Promise.all(
    allViews.map((v) =>
      crossFetch(`${apiHostname}/all/views/${v}`).then((r) => r.text())
    )
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

  allViews.forEach((v, i) => {
    fs.writeFileSync(
      `${__dirname}/clients/__snapshots__/all/views/${v}`,
      allViewData[i]
    );
  });

  views.forEach((v, i) => {
    fs.writeFileSync(
      `${__dirname}/clients/__snapshots__/arbitrum/views/${v}`,
      viewData[i]
    );
  });
}

main()
  .catch(console.error)
  .then(() => {
    process.exit();
  });
