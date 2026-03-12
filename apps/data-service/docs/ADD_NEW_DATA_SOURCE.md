# Adding New Data Sources to the Data Service

This guide provides step-by-step instructions for adding new oracle or other data sources to the Notional data service.

## Overview

The data service collects on-chain data (oracle prices, exchange rates, balances, etc.) and stores it in a PostgreSQL database. Data sources are configured in TypeScript files, and the service automatically picks up new configurations.

## When to Use This Guide

Use this process when you need to:

- Add new oracle price feeds
- Track new exchange rates between tokens
- Monitor contract state (balances, supply, etc.)
- Collect any other on-chain data via contract calls

## Prerequisites

Before adding a new data source, gather the following information:

1. **Contract Address**: The address of the contract to query
2. **Network**: Which blockchain (mainnet, arbitrum, etc.)
3. **Method Signature**: The exact function signature to call (e.g., `function lastAnswer() view external returns (int256)`)
4. **Method Name**: The name of the method (e.g., `lastAnswer`)
5. **Method Arguments** (optional): Any arguments needed for the method call
6. **Decimals**: How many decimals the returned value uses (commonly 8 or 18)
7. **Variable Name**: A descriptive name for this data (e.g., "ETH to USD Oracle")
8. **Block Range** (optional): `firstBlock` and/or `finalBlock` if the data source is only valid for a specific block range

## Step-by-Step Process

### Step 1: Add Configuration Entry

1. Open the file: `/apps/data-service/src/config/GenericConfig.ts`

2. Add a new configuration object to the `configDefs` array following this template:

```typescript
{
  sourceType: SourceType.Multicall,
  sourceConfig: {
    contractAddress: '<CONTRACT_ADDRESS>',
    contractABI: ['<FUNCTION_SIGNATURE>'],
    method: '<METHOD_NAME>',
    // Optional: add if method requires arguments
    // args: [<ARGUMENTS>],
    // Optional: add if data source only valid for specific block range
    // firstBlock: <STARTING_BLOCK>,
    // finalBlock: <ENDING_BLOCK>,
  },
  tableName: TableName.GenericData,
  dataConfig: {
    strategyId: Strategy.Generic,
    variable: '<DESCRIPTIVE_VARIABLE_NAME>',
    decimals: <DECIMALS>,
  },
  network: Network.<NETWORK_NAME>,
}
```

3. **Example** (from PR #1463):

```typescript
{
  sourceType: SourceType.Multicall,
  sourceConfig: {
    contractAddress: '0x8D51DBC85cEef637c97D02bdaAbb5E274850e68C',
    contractABI: ['function lastAnswer() view external returns (int256)'],
    method: 'lastAnswer',
  },
  tableName: TableName.GenericData,
  dataConfig: {
    strategyId: Strategy.Generic,
    variable: 'mF-ONE to USD Exchange Rate',
    decimals: 8,
  },
  network: Network.mainnet,
}
```

4. **Multiple Oracles**: If adding multiple related oracles, add multiple configuration objects to the array

### Step 2: Create Backfill Script (Optional but Recommended)

Backfilling populates historical data for the new oracle(s).

1. Create a new file: `/apps/data-service/backfill-<descriptor>.sh`

   - Replace `<descriptor>` with something meaningful (e.g., `backfill-midas-oracles.sh`)

2. Use this template:

```bash
#!/bin/bash

# Usage: ./backfill-<descriptor>.sh <startTime> <endTime> [baseUrl]
# Example: ./backfill-<descriptor>.sh 1704067200 1735689600

startTime=$1
endTime=$2
baseUrl=${3:-https://us-central1-monitoring-agents.cloudfunctions.net/data-service}

# Load auth token from .dev.vars
source .dev.vars

# Array of oracle addresses to backfill
declare -a oracles=(
  "0x<ORACLE_ADDRESS_1>"
  "0x<ORACLE_ADDRESS_2>"
  "0x<ORACLE_ADDRESS_3>"
)

# Backfill each oracle
for oracle in "${oracles[@]}"
do
  echo "Backfilling oracle: $oracle"

  response=$(curl -s -w "\n%{http_code}" -X GET \
    "$baseUrl/backfillGenericData?contractAddress=$oracle&startTime=$startTime&endTime=$endTime" \
    -H "x-auth-token: $DATA_SERVICE_AUTH_TOKEN")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    echo "✓ Success: $oracle"
  else
    echo "✗ Failed: $oracle (HTTP $http_code)"
    echo "Response: $body"
  fi

  echo ""
done

echo "Backfill complete"
```

3. Make the script executable:

```bash
chmod +x /apps/data-service/backfill-<descriptor>.sh
```

4. **IMPORTANT**: The backfill script should be added to `.gitignore` so it's available locally but not committed to the repository.

### Step 3: Update .gitignore

Add the backfill script pattern to `/apps/data-service/.gitignore`:

```
backfill-*.sh
```

This ensures backfill scripts remain local and aren't pushed to the repository.

### Step 4: Test the Configuration

1. **Start the data service locally** (if not already running):

```bash
# From the data-service directory
npm run dev
```

2. **Verify the configuration is loaded**: Check the service logs for any errors related to your new configuration

3. **Test data collection**: The service should automatically start collecting data at the next interval

### Step 5: Run Backfill (Optional)

If you created a backfill script and want to populate historical data:

1. Ensure you have a `.dev.vars` file with `DATA_SERVICE_AUTH_TOKEN` set (production auth token)

2. Run the backfill script (this will backfill to production by default):

```bash
./backfill-<descriptor>.sh <startTimestamp> <endTimestamp>
```

Example timestamps:

- Start: `1704067200` (January 1, 2024)
- End: `1735689600` (December 31, 2024)

Note: The backfill script defaults to the production URL (`https://us-central1-monitoring-agents.cloudfunctions.net/data-service`). To backfill to a different environment, pass the base URL as a third argument:

```bash
./backfill-<descriptor>.sh <startTimestamp> <endTimestamp> http://localhost:8080
```

### Step 6: Deploy to Production

Before creating a PR, you should deploy the changes to production to test them:

1. **Deploy from your terminal**:

```bash
# From the monorepo root
yarn nx run data-service:deploy-gcp
```

This will:

- Build the data-service
- Deploy both the data-service and cron-service functions to GCP in parallel

2. **Verify the deployment**: Check the GCP console or logs to ensure the deployment succeeded

3. **Monitor data collection**: The new oracle should start collecting data at the next scheduled interval

### Step 7: Create Pull Request

1. **Only commit the configuration change** (`GenericConfig.ts`, `.gitignore`, and docs)
2. **Do NOT commit** the backfill script (it should be ignored by git)
3. Create a PR with a descriptive title like "Add [Oracle Name] data sources"
4. In the PR description, document:
   - What oracles were added
   - What data they provide
   - Why they're needed
   - Note that you've already deployed and tested in production

## Quick Reference: Configuration Fields

| Field             | Description                      | Required | Example                                                    |
| ----------------- | -------------------------------- | -------- | ---------------------------------------------------------- |
| `sourceType`      | How to fetch the data            | Yes      | `SourceType.Multicall`                                     |
| `contractAddress` | Contract to query                | Yes      | `'0x8D51...'`                                              |
| `contractABI`     | Function signature               | Yes      | `['function lastAnswer() view external returns (int256)']` |
| `method`          | Method name                      | Yes      | `'lastAnswer'`                                             |
| `args`            | Method arguments                 | No       | `[ethers.utils.parseEther('1')]`                           |
| `firstBlock`      | Start collecting from this block | No       | `132900686`                                                |
| `finalBlock`      | Stop collecting at this block    | No       | `17971301`                                                 |
| `tableName`       | Database table                   | Yes      | `TableName.GenericData`                                    |
| `strategyId`      | Strategy identifier              | Yes      | `Strategy.Generic`                                         |
| `variable`        | Descriptive name                 | Yes      | `'ETH to USD Oracle'`                                      |
| `decimals`        | Decimal places                   | Yes      | `8` or `18`                                                |
| `network`         | Blockchain network               | Yes      | `Network.mainnet`                                          |

## Common Patterns

### Oracle Price Feeds (Chainlink-style)

```typescript
{
  sourceType: SourceType.Multicall,
  sourceConfig: {
    contractAddress: '<ORACLE_ADDRESS>',
    contractABI: IAggregatorABI, // or ['function latestAnswer() view external returns (int256)']
    method: 'latestAnswer',
  },
  tableName: TableName.GenericData,
  dataConfig: {
    strategyId: Strategy.Generic,
    variable: '<TOKEN> to USD Oracle',
    decimals: 8,
  },
  network: Network.mainnet,
}
```

### Exchange Rate Contracts

```typescript
{
  sourceType: SourceType.Multicall,
  sourceConfig: {
    contractAddress: '<CONTRACT_ADDRESS>',
    contractABI: ['function getExchangeRate() view returns (uint256)'],
    method: 'getExchangeRate',
  },
  tableName: TableName.GenericData,
  dataConfig: {
    strategyId: Strategy.Generic,
    variable: '<TOKEN_A> to <TOKEN_B> ratio',
    decimals: 18,
  },
  network: Network.mainnet,
}
```

### ERC20 Token Balances

```typescript
{
  sourceType: SourceType.Multicall,
  sourceConfig: {
    contractAddress: '<TOKEN_ADDRESS>',
    contractABI: ERC20ABI,
    method: 'balanceOf',
    args: ['<WALLET_ADDRESS>'],
  },
  tableName: TableName.GenericData,
  dataConfig: {
    strategyId: Strategy.Generic,
    variable: '<TOKEN> balance of <OWNER>',
    decimals: 18,
  },
  network: Network.mainnet,
}
```

## Claude Agent Instructions

**When a user says**: "Claude, we're going to add some more oracles to the data service" or similar:

### 1. Prompt for Information

Ask the user to provide the following for each oracle/data source:

```
For each data source, I need the following information:

1. Contract Address:
2. Network (mainnet, arbitrum, etc.):
3. Method to call (e.g., lastAnswer, getRate, etc.):
4. Function signature (e.g., "function lastAnswer() view external returns (int256)"):
5. Decimals (usually 8 or 18):
6. Descriptive name for the variable (e.g., "ETH to USD Oracle"):
7. Any method arguments needed? (optional):
8. Block range restrictions? (firstBlock/finalBlock, optional):
```

### 2. Add Configuration

- Open `/apps/data-service/src/config/GenericConfig.ts`
- Add the new configuration object(s) to the `configDefs` array
- Follow the patterns shown in "Common Patterns" section above

### 3. Create Backfill Script

- Create `/apps/data-service/backfill-<descriptor>.sh` with the provided template
- Include all oracle addresses that were added
- Make the script executable: `chmod +x`
- The script defaults to production URL (`https://us-central1-monitoring-agents.cloudfunctions.net/data-service`), not localhost

### 4. Update .gitignore

- Check if `/apps/data-service/.gitignore` already has `backfill-*.sh`
- If not, add it

### 5. Prompt User to Deploy

After adding the configuration and creating the backfill script, prompt the user to deploy:

**Say this to the user:**

```
Configuration added successfully!

Next steps:
1. Deploy to production:
   yarn nx run data-service:deploy-gcp

2. (Optional) Run backfill script to production:
   cd apps/data-service
   ./backfill-<descriptor>.sh <startTimestamp> <endTimestamp>

   Note: Ensure DATA_SERVICE_AUTH_TOKEN is set in .dev.vars with the production token

3. After deployment succeeds and you verify data collection, create a PR with:
   - GenericConfig.ts changes
   - .gitignore update
   - Documentation updates

The backfill script will remain local (git-ignored).
```

### 6. Confirm with User

Summarize what was added:

- Configuration entries added to GenericConfig.ts
- Backfill script created and location
- .gitignore updated
- Remind them to deploy before creating PR

## Troubleshooting

### Data not appearing

1. Check service logs for errors
2. Verify the contract address is correct
3. Ensure the method signature matches the contract exactly
4. Confirm the network is correct

### Backfill failing

1. Verify `DATA_SERVICE_AUTH_TOKEN` is set in `.dev.vars`
2. **IMPORTANT**: Ensure you're using the `x-auth-token` header (NOT `Authorization: Bearer`)
3. Check that the data service is running
4. Ensure timestamps are valid Unix timestamps
5. Verify contract existed at the specified block range

### Wrong decimals

If values look too large or too small, the decimals might be incorrect:

- Chainlink oracles typically use 8 decimals
- Most token exchange rates use 18 decimals
- Check the contract documentation or Etherscan

## Database Schema

Data is stored in the `generic_data` table with this structure:

```sql
CREATE TABLE generic_data (
  strategy_id INT,
  variable VARCHAR(256),
  network INT,
  timestamp INT,
  block_number BIGINT,
  decimals SMALLINT,
  contract_address VARCHAR(256),
  method VARCHAR(256),
  value NUMERIC,
  PRIMARY KEY(strategy_id, variable, network, timestamp)
);
```

No schema changes are needed when adding new data sources.
