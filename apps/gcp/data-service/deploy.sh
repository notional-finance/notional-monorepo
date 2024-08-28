#!/bin/sh
set -e

cd ../../../dist/apps/gcp/data-service
mv index.cjs index.js

# Update package.json to use index.js instead of index.cjs
if [ "$(uname)" = "Darwin" ]; then
  # macOS
  sed -i '' 's/"main": ".\/index.cjs"/"main": ".\/index.js"/' package.json
else
  # Linux
  sed -i 's/"main": ".\/index.cjs"/"main": ".\/index.js"/' package.json
fi

gcloud --project monitoring-agents \
  functions deploy data-service \
  --region us-central1 \
  --runtime nodejs20 \
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

gcloud --project monitoring-agents \
  functions deploy cron-service \
  --region us-central1 \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point=cronService \
  --gen2 \
  --timeout=600 \
  --concurrency=1 \
  --cpu=2 \
  --memory=1024 \
  --service-account=663932775145-compute@developer.gserviceaccount.com \
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
  
cd -
#Set the base URI as an environment variable
# Get the function URI using gcloud
BASE_URI=$(gcloud functions describe cron-service --region=us-central1 --format='value(url)')
echo "Base URI: $BASE_URI"
# Read and create jobs from cron.yaml
while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ $line == *"description:"* ]]; then
        description=$(echo "$line" | sed -E 's/.*description: *"(.*)".*/\1/')
    elif [[ $line == *"url:"* ]]; then
        url=$(echo "$line" | sed -E 's/.*url: *(.*)$/\1/')
    elif [[ $line == *"schedule:"* ]]; then
        schedule=$(echo "$line" | sed -E 's/.*schedule: *(.*)$/\1/')
        # Create the job
        job_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
        gcloud scheduler jobs update http "$job_name" \
            --location=us-central1 \
            --schedule="$schedule" \
            --uri="${BASE_URI}${url}" \
            --http-method GET \
            --attempt-deadline=1800s \
            --description="$description"
        
        echo "Created job: $job_name $url $schedule"
    fi
done < cron.yaml


