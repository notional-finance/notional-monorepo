#!/bin/bash
set -e

source .env

# Set your Google Cloud project ID
PROJECT_ID="monitoring-agents"
REGION="us-central1"
SERVICE_NAME="cron-service"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# Build and push Docker image to GCR
echo "Building and pushing Docker image to GCR..."
docker buildx create --use --name multiarch-builder || true
docker buildx use multiarch-builder
docker buildx build --platform linux/amd64 -t $IMAGE_NAME --push .

# Function to read YAML file and format secrets for gcloud command
format_secrets() {
    local file=$1
    local result=""
    while IFS=':' read -r key value; do
        # Trim leading/trailing whitespace
        key=$(echo $key | xargs)
        value=$(echo $value | xargs)
        result+="$key=$value,"
    done < "$file"
    echo "${result%,}"  # Remove trailing comma
}

# Read and format secrets
SECRETS=$(format_secrets cron-secrets.yaml)
echo "secrets: $SECRETS"

# Deploy Cloud Run service
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME \
  --platform managed \
  --region=$REGION \
  --env-vars-file=cron-vars.yaml \
  --set-secrets="$SECRETS" \
  --add-cloudsql-instances=monitoring-agents:us-central1:notional


# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

# Function to update a scheduler job
update_scheduler_job() {
    local name=$1
    local schedule=$2
    local uri=$3
    local retry_count=${4:-0}
    local min_backoff=${5:-""}

    local retry_args=""
    if [ $retry_count -gt 0 ]; then
        retry_args="--retry-count=$retry_count"
        if [ ! -z "$min_backoff" ]; then
            retry_args="$retry_args --min-backoff-duration=$min_backoff"
        fi
    fi

    gcloud scheduler jobs update http $name \
      --location=$REGION \
      --schedule="$schedule" \
      --uri="${SERVICE_URL}${uri}" \
      --http-method=GET \
      $retry_args
}

# Update scheduler jobs based on cron.yaml
update_scheduler_job "risk-service" "*/10 * * * *" "/calculateRisk"
update_scheduler_job "sync-dune" "30 1 * * *" "/syncDune" 1 "1800s"
update_scheduler_job "calculate-points" "5 1 * * *" "/calculatePoints" 2 "1800s"
update_scheduler_job "sync-generic-data" "0 * * * *" "/syncGenericData"
update_scheduler_job "sync-oracle-data" "0 * * * *" "/syncOracleData"
update_scheduler_job "sync-accounts-arbitrum" "*/20 * * * *" "/syncAccounts?network=arbitrum"
update_scheduler_job "sync-accounts-mainnet" "*/20 * * * *" "/syncAccounts?network=mainnet"
update_scheduler_job "sync-vault-accounts-arbitrum" "*/20 * * * *" "/syncVaultAccounts?network=arbitrum"
update_scheduler_job "sync-vault-accounts-mainnet" "*/20 * * * *" "/syncVaultAccounts?network=mainnet"

echo "Scheduler jobs updated."

# Create a new scheduler job using:
#    gcloud scheduler jobs create http $JOB_NAME \
#      --location=us-central1 \
#      --schedule="*/20 * * * *" \
#      --uri="https://${SERVICE_URL}/syncVaultAccounts?network=arbitrum" \
#      --http-method=GET \
#      --update-headers="x-auth-token=${DATA_SERVICE_AUTH_TOKEN}"