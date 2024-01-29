const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 4000; // Port for the Express server

// Enable CORS for all routes
app.use(cors());

// Define a proxy for /*/tokens to localhost:8787
// const tokensProxy = createProxyMiddleware(
//   ['/*/tokens', '/*/configuration', '/*/vaults'],
//   {
//     target: 'http://localhost:8888',
//     changeOrigin: true,
//   }
// );

// // Define a proxy for /*/oracles to localhost:8888
// const oraclesProxy = createProxyMiddleware(['/*/oracles', '/*/exchanges'], {
//   target: 'http://localhost:8889',
//   changeOrigin: true,
// });

const dataProxy = createProxyMiddleware(['/*/views/*'], {
  target: 'http://localhost:8890',
  changeOrigin: true,
});

// Use the proxies for the specified paths
// app.use(tokensProxy);
// app.use(oraclesProxy);
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
