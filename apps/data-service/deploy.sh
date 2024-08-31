#!/bin/sh
set -e

echo "Deploying ${1} functions"

cd ./dist
# Remove dependencies from package.json to speed up deployment, no need to install them since they are already bundled
jq 'del(.dependencies)' package.json > temp${1}.json && mv temp${1}.json package.json
jq 'del(.devDependencies)' package.json > temp${1}.json && mv temp${1}.json package.json


# Check if the first argument is provided
if [ -z "$1" ]; then
    echo "Error: Please provide 'data-service' or 'cron-service' as the first argument."
    exit 1
fi

# Deploy based on the first argument
if [ "$1" = "data-service" ]; then
    gcloud --project monitoring-agents \
      functions deploy data-service \
      --region us-central1 \
      --runtime nodejs22 \
      --trigger-http \
      --allow-unauthenticated \
      --entry-point=dataService \
      --gen2 \
      --timeout=600 \
      --concurrency=1 \
      --cpu=1 \
      --memory=256 \
      --set-env-vars=\
DB_USER=postgres,\
DB_NAME=notional-v3,\
DB_HOST=/cloudsql/monitoring-agents:us-central1:notional,\
REGISTRY_URL=https://registry.notional.finance,\
MERGE_CONFLICTS=false,\
NX_USE_CROSS_FETCH=true,\
CLOUDFLARE_ACCOUNT_ID=274f86c6dcfbb77c09e49e86d101c753,\
R2_ACCESS_KEY_ID=09f2809bc45eba2e05cf8cf7cb91a269 \
  --set-secrets=\
DB_PASS=projects/663932775145/secrets/DB_PASS/versions/latest,\
DATA_SERVICE_AUTH_TOKEN=projects/663932775145/secrets/DATA_SERVICE_AUTH_TOKEN/versions/latest,\
R2_SECRET_ACCESS_KEY=projects/663932775145/secrets/R2_SECRET_ACCESS_KEY/versions/latest,\
DUNE_API_KEY=projects/663932775145/secrets/DUNE_API_KEY/versions/latest,\
SUBGRAPH_API_KEY=projects/663932775145/secrets/SUBGRAPH_API_KEY/versions/latest,\
DD_API_KEY=projects/663932775145/secrets/DD_API_KEY/versions/latest

elif [ "$1" = "cron-service" ]; then
    gcloud --project monitoring-agents \
      functions deploy cron-service \
      --region us-central1 \
      --runtime nodejs22 \
      --trigger-http \
      --allow-unauthenticated \
      --entry-point=cronService \
      --gen2 \
      --timeout=600 \
      --concurrency=1 \
      --cpu=2 \
      --memory=1024 \
      --set-env-vars=\
DB_USER=postgres,\
DB_NAME=notional-v3,\
DB_HOST=/cloudsql/monitoring-agents:us-central1:notional,\
REGISTRY_URL=https://registry.notional.finance,\
MERGE_CONFLICTS=false,\
NX_USE_CROSS_FETCH=true,\
CLOUDFLARE_ACCOUNT_ID=274f86c6dcfbb77c09e49e86d101c753,\
R2_ACCESS_KEY_ID=09f2809bc45eba2e05cf8cf7cb91a269 \
  --set-secrets=\
DB_PASS=projects/663932775145/secrets/DB_PASS/versions/latest,\
DATA_SERVICE_AUTH_TOKEN=projects/663932775145/secrets/DATA_SERVICE_AUTH_TOKEN/versions/latest,\
R2_SECRET_ACCESS_KEY=projects/663932775145/secrets/R2_SECRET_ACCESS_KEY/versions/latest,\
DUNE_API_KEY=projects/663932775145/secrets/DUNE_API_KEY/versions/latest,\
SUBGRAPH_API_KEY=projects/663932775145/secrets/SUBGRAPH_API_KEY/versions/latest,\
DD_API_KEY=projects/663932775145/secrets/DD_API_KEY/versions/latest

else
    echo "Error: Invalid argument. Please provide 'data-service' or 'cron-service'."
    exit 1
fi