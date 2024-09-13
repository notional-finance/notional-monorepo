#!/bin/bash
set -e

yarn nx affected --target deploy-tenderly --base=v3/prod~1 --head=v3/prod
