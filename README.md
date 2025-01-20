# Notional Finance Monorepo

This is the monorepo for all the Notional finance code. It is split into two main areas:

- `apps/`: includes all deployed Cloudflare workers, websites and Google Cloud Functions.
- `packages/`: includes library code used between different applications
  - `common`: UI components used across the app
  - `contracts`: smart contract ABIs and typechain artifacts
  - `core-entities`: logic to maintain data synchronization with the blockchain
  - `multicall`: utility for making batch calls to the blockchain
  - `notionable`: frontend UI logic
  - `risk-engine`: risk calculations for accounts
  - `shared`: shared website components
  - `features`: shared website components
  - `transaction`: blockchain transaction building components
  - `utils`: generic constants and utilities

## Dev Environment

1. Install Dependencies from the root: `yarn install`
2. Serve the development website: `yarn nx serve web`
   - You will need to create a `web/.env` file
3. The site will be served at http://localhost:3000

```
NX_CONTACT_EMAIL=support@notional.finance
NX_APP_URL=http://localhost:3000
NX_SUBGRAPH_API_KEY=
NX_REGISTRY_URL=http://registry-dev.notional.finance
```
