#!/bin/bash
set -e

yarn nx affected --target publish-wrangler --base=v3/prod~1 --head=v3/prod

# Registry
# yarn nx publish-wrangler-manual api --env prod
# yarn nx publish-wrangler-manual registry --env prod

# Accounts
# yarn nx publish-wrangler-manual accounts --env dev

# # Bots
# yarn nx publish-wrangler-manual note-reward-manager --env dev
# yarn nx publish-wrangler-manual rewards --env dev
# yarn nx publish-wrangler-manual initialize-markets --env dev
# yarn nx publish-wrangler-manual liquidation-bot --env arbitrum2
# yarn nx publish-wrangler-manual liquidation-bot --env mainnet2
# yarn nx publish-wrangler-manual vault-liquidator --env arbitrum
# yarn nx publish-wrangler-manual vault-liquidator --env mainnet

# # Points
# yarn nx publish-wrangler-manual points --env prod
