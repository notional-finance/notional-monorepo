const crossFetch = require('cross-fetch');
const fs = require('fs');

async function main() {
  const apiHostname = 'http://data-dev.notional.finance';
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

  const allTokens = await crossFetch(`${apiHostname}/all/tokens`).then((r) =>
    r.text()
  );
  const allOracles = await crossFetch(`${apiHostname}/all/oracles`).then((r) =>
    r.text()
  );

  const views = [
    'asset_price_volatility',
    'historical_oracle_values',
    'notional_asset_historical_prices',
    'notional_assets_apys_and_tvls',
    'nToken_trading_fees_apys',
    '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa',
    '0xb6efe4f505248846465f944801e299c14269126b',
    '0xb9bdaa34ea52c3e2f3ec39fcd8146887e6b1c78c',
    '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
  ];

  viewData = await Promise.all(
    views.map((v) =>
      crossFetch(`${apiHostname}/arbitrum/views/${v}`).then((r) => r.text())
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
  fs.writeFileSync(`${__dirname}/clients/__snapshots__/all/tokens`, allTokens);
  fs.writeFileSync(
    `${__dirname}/clients/__snapshots__/all/oracles`,
    allOracles
  );

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
