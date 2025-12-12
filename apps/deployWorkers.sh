#!/bin/bash
set -e

# yarn nx affected --target publish-wrangler --base=v3/prod~1 --head=v3/prod

yarn nx publish-wrangler-manual registry --env dev
yarn nx publish-wrangler-manual beta-contest --env dev

# Registry
# yarn nx publish-wrangler-manual api --env prod

# # Points
# yarn nx publish-wrangler-manual points --env prod