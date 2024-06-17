#!/bin/bash
set -e

yarn nx publish-wrangler-manual accounts --env dev
yarn nx publish-wrangler-manual api --env dev
# NOTE: currently disabled because this causes issues
# yarn nx publish-wrangler-manual data --env dev

# Registry
yarn nx publish-wrangler-manual registry-configuration --env dev
yarn nx publish-wrangler-manual registry-vaults --env dev
yarn nx publish-wrangler-manual registry-tokens --env dev
yarn nx publish-wrangler-manual registry-oracles --env dev
yarn nx publish-wrangler-manual registry-exchanges --env dev

# Bots
yarn nx publish-wrangler-manual rewards --env dev
yarn nx publish-wrangler-manual initialize-markets --env dev
yarn nx publish-wrangler-manual liquidation-bot --env arbitrum
yarn nx publish-wrangler-manual liquidation-bot --env mainnet
yarn nx publish-wrangler-manual vault-liquidator --env arbitrum
yarn nx publish-wrangler-manual vault-liquidator --env mainnet

# Points
yarn nx publish-wrangler-manual points --env prod
