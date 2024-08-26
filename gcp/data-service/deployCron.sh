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

gcloud scheduler jobs update http sync-vault-accounts-arbitrum \
  --location=$REGION \
  --schedule="*/20 * * * *" \
  --uri="${SERVICE_URL}/syncVaultAccounts?network=arbitrum" \
  --http-method=GET \
  --update-headers="x-auth-token=${DATA_SERVICE_AUTH_TOKEN}"

gcloud scheduler jobs create http sync-vault-accounts-mainnet \
  --location=$REGION \
  --schedule="*/20 * * * *" \
  --uri="${SERVICE_URL}/syncVaultAccounts?network=mainnet" \
  --http-method=GET \
  --update-headers="x-auth-token=${DATA_SERVICE_AUTH_TOKEN}"

echo "Deployment and scheduler job creation completed."