# Exponent Liquidator

A Cloudflare Worker that monitors and liquidates risky positions in Notional's Exponent vaults on Ethereum mainnet and Arbitrum.

## Overview

The Exponent Liquidator:
- Fetches risky positions from Hypernative API
- Evaluates positions for liquidation eligibility
- Handles multiple vault types (Staking, PendlePT, CurveConvex2Token)
- Executes flash liquidations through the Flash Liquidator contract
- Runs as a scheduled Cloudflare Worker (every 2 minutes)

## Prerequisites

- Node.js >= 20.0.0
- Yarn package manager
- Cloudflare account (for deployment)
- Alchemy API key (for forking in tests)

## Installation

This is part of a Yarn workspace monorepo. From the root directory:

```bash
# Install all dependencies
yarn install
```

## Environment Configuration

Create a `.dev.vars` file in the `apps/exponent-liquidator` directory with the following variables:

```bash
# Datadog (for logging)
DD_API_KEY=your_datadog_api_key

# Transaction relay
TX_RELAY_AUTH_TOKEN=your_tx_relay_token

# Hypernative (for fetching risky positions)
HYPERNATIVE_CLIENT_ID=your_hypernative_client_id
HYPERNATIVE_CLIENT_SECRET=your_hypernative_client_secret

# Alchemy (for test forks)
ALCHEMY_KEY=your_alchemy_api_key
```

### Production Configuration

Production environment variables are configured in `wrangler.toml`:

- `MORPHO_LENDING_ROUTER_ADDRESS`: Morpho lending router contract
- `FLASH_LIQUIDATOR_ADDRESS`: Flash liquidation contract
- `TRADING_MODULE_ADDRESS`: Trading module for price oracles
- `NETWORK`: Network to run on (mainnet or arbitrum)

## Running Tests

The liquidator includes a comprehensive test framework that uses Anvil for local forking.

### List Available Tests

```bash
npx tsx test/cli.ts list test/cases/mainnet-cases.json
```

### Run a Single Test

```bash
npx tsx test/cli.ts single test/cases/mainnet-cases.json "weETH staking withdraw request"
```

### Run Entire Test Suite

```bash
npx tsx test/cli.ts suite test/cases/mainnet-cases.json
```

### Override Fork Block

You can override the fork block number for any test:

```bash
npx tsx test/cli.ts single test/cases/mainnet-cases.json "weETH staking withdraw request" --fork-block 23670500
```

### Test Structure

Test cases are defined in JSON files under `test/cases/`. Each test case specifies:

- **name**: Test case name
- **description**: What the test validates
- **forkBlock**: Ethereum block to fork from
- **network**: Network to test (mainnet/arbitrum)
- **positions**: Array of [account, vault] tuples to test
- **expectedResults**: Expected transaction outcomes
- **timeout**: Test timeout in milliseconds

## Running Locally

### Development Mode

To run the liquidator locally against a forked network:

```bash
# Start Wrangler dev server
npx wrangler dev

# In another terminal, trigger a run
curl http://localhost:8787/
```

### Test Endpoint

The liquidator exposes a `/test` endpoint for running with custom positions and fork:

```bash
curl -X POST http://localhost:8787/test \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      ["0xACCOUNT_ADDRESS", "0xVAULT_ADDRESS"]
    ],
    "forkUrl": "http://127.0.0.1:8545"
  }'
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Deploy to mainnet environment
npx wrangler deploy --env mainnet

# Deploy to arbitrum environment
npx wrangler deploy --env arbitrum
```

### Scheduled Runs

The worker is configured to run automatically every 2 minutes via Cloudflare Cron Triggers (see `wrangler.toml`).

## Architecture

### Key Components

- **ExponentLiquidator**: Main liquidation orchestrator
- **VaultRegistry**: Manages vault configurations and on-chain data
- **Token Pricing**: Batch fetches token prices and decimals
  - Note: CurveConvex2Token yieldTokens have decimals hardcoded to 18 (they don't implement `decimals()`)
- **Redeem Data Generator**: Creates liquidation calldata for different vault types
- **Data Service**: Fetches risky positions from Hypernative API

### Vault Types

1. **Staking**: Simple staking vaults (e.g., weETH, pufETH)
2. **PendlePT**: Pendle PT vaults with market-based redemption
3. **CurveConvex2Token**: Curve 2-token LP vaults

### Workflow

1. Fetch risky positions from Hypernative
2. Initialize vault registry with on-chain configurations
3. Enrich positions with collateral and withdraw request data
4. Fetch token prices for all required tokens
5. Calculate liquidation profitability
6. Generate redemption calldata for each vault type
7. Submit transactions via TX relay service
8. Log results to Datadog

## Project Structure

```
apps/exponent-liquidator/
├── src/
│   ├── index.ts                    # Cloudflare Worker entry point
│   ├── ExponentLiquidator.ts       # Main liquidation logic
│   ├── types.ts                    # TypeScript type definitions
│   ├── abis/                       # Contract ABIs
│   ├── configs/                    # Vault configurations
│   ├── constants/                  # Contract addresses
│   └── utils/
│       ├── vaultRegistry.ts        # Vault configuration manager
│       ├── tokenPricing.ts         # Token price fetching
│       ├── redeemDataGenerator.ts  # Liquidation calldata generation
│       ├── dataService.ts          # Hypernative API client
│       └── logging.ts              # Datadog logging
├── test/
│   ├── cli.ts                      # Test CLI
│   ├── runner.ts                   # Test execution engine
│   ├── utils.ts                    # Test utilities (Anvil fork manager)
│   └── cases/
│       └── mainnet-cases.json      # Test case definitions
├── wrangler.toml                   # Cloudflare Worker configuration
└── tsconfig.json                   # TypeScript configuration
```

## Troubleshooting

### Tests Failing to Fork

- Ensure `ALCHEMY_KEY` is set in `.dev.vars`
- Check that Anvil is available (`foundry` is installed)
- Verify the fork block number is not too recent (wait for finalization)

### Decimals Revert Error

If you see errors about `decimals()` calls reverting:
- CurveConvex2Token yieldTokens don't implement `decimals()`
- This is handled automatically by hardcoding to 18 decimals
- See `src/utils/tokenPricing.ts` for implementation

### Price Fetch Failures

- Verify `TRADING_MODULE_ADDRESS` is correct for the network
- Ensure tokens have oracle prices configured
- Check multicall isn't timing out (increase provider timeout)

## Contributing

When adding new vault types or features:

1. Update vault type enum in `src/types.ts`
2. Add vault-specific logic to `VaultRegistry`
3. Update `redeemDataGenerator.ts` for redemption logic
4. Update `tokenPricing.ts` if special token handling is needed
5. Add test cases to validate the new functionality

## License

MIT
