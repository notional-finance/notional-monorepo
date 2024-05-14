const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 4000; // Port for the Express server

// Enable CORS for all routes
app.use(cors());

// Define a proxy for /*/tokens to localhost:8787
const configProxy = createProxyMiddleware(['/*/configuration'], {
  target: 'https://registry-configuration-dev.notional-finance.workers.dev',
  changeOrigin: true,
});
const tokensProxy = createProxyMiddleware(['/*/tokens'], {
  target: 'http://localhost:8891',
  // target: 'https://registry-tokens-dev.notional-finance.workers.dev',
  changeOrigin: true,
});
const vaultsProxy = createProxyMiddleware(['/*/vaults'], {
  target: 'https://registry-vaults-dev.notional-finance.workers.dev',
  changeOrigin: true,
});
const oraclesProxy1 = createProxyMiddleware(['/arbitrum/oracles'], {
  target: 'http://localhost:8890',
  changeOrigin: true,
});
const oraclesProxy2 = createProxyMiddleware(
  ['/mainnet/oracles', '/all/oracles'],
  {
    target: 'https://registry-oracles-dev.notional-finance.workers.dev',
    changeOrigin: true,
  }
);
const exchangesProxy = createProxyMiddleware(['/*/exchanges'], {
  target: 'http://localhost:8890',
  // target: 'https://registry-exchanges-dev.notional-finance.workers.dev',
  changeOrigin: true,
});
const dataProxy = createProxyMiddleware(['/*/views/*'], {
  target: 'https://data-dev.notional-finance.workers.dev',
  changeOrigin: true,
});

// Use the proxies for the specified paths
app.use(tokensProxy);
app.use(configProxy);
app.use(oraclesProxy1);
app.use(oraclesProxy2);
app.use(vaultsProxy);
app.use(exchangesProxy);
app.use(dataProxy);

// Define a catch-all proxy to forward any other requests to the specified URL
const catchAllProxy = createProxyMiddleware(['**'], {
  target: 'https://data-dev.notional.finance',
  changeOrigin: true,
});
app.use(catchAllProxy);

app.listen(port, () => {
  console.log(`Proxy server is running on http://localhost:${port}`);
});
