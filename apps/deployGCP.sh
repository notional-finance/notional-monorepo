#!/bin/bash
set -e

yarn nx affected --target deploy-gcp --base=v3/prod~1 --head=v3/prod
