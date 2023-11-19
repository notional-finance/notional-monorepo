#!/bin/bash
set -e

yarn nx publish-wrangler-manual accounts --env dev
yarn nx publish-wrangler-manual api --env dev
yarn nx publish-wrangler-manual data --env dev
yarn nx publish-wrangler-manual liquidation-bot --env dev
yarn nx publish-wrangler-manual registry --env dev
yarn nx publish-wrangler-manual registry-exchange --env dev
yarn nx publish-wrangler-manual rewards --env dev
yarn nx publish-wrangler-manual vault-liquidator --env dev