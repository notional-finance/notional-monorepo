#!/bin/bash
set -e

yarn nx affected --target deploy-gcp --base=v3/prod~1 --head=v3/prod
yarn nx affected --target deploy-cron --base=v3/prod~1 --head=v3/prod
