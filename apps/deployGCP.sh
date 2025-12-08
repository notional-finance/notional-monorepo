#!/bin/bash
set -e

yarn nx affected --target deploy-gcp --base=v4/prod~1 --head=v4/prod
yarn nx affected --target deploy-cron --base=v4/prod~1 --head=v4/prod
