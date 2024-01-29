const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 4000; // Port for the Express server

// Enable CORS for all routes
app.use(cors());

// Define a proxy for /*/tokens to localhost:8787
const configProxy = createProxyMiddleware(['/*/configuration'], {
  target: 'http://localhost:8885',
  changeOrigin: true,
});
const tokensProxy = createProxyMiddleware(['/*/tokens'], {
  target: 'http://localhost:8886',
  changeOrigin: true,
});
const vaultsProxy = createProxyMiddleware(['/*/vaults'], {
  target: 'http://localhost:8887',
  changeOrigin: true,
});
const oraclesProxy = createProxyMiddleware(['/*/oracles'], {
  target: 'http://localhost:8888',
  changeOrigin: true,
});
const exchangesProxy = createProxyMiddleware(['/*/exchanges'], {
  target: 'http://localhost:8889',
  changeOrigin: true,
});
const dataProxy = createProxyMiddleware(['/*/views/*'], {
  target: 'http://localhost:8890',
  changeOrigin: true,
});

// Use the proxies for the specified paths
app.use(tokensProxy);
app.use(configProxy);
app.use(oraclesProxy);
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
