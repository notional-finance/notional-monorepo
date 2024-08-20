#!/bin/bash
set -e

# Set your Google Cloud project ID
REGION="us-central1"
SERVICE_NAME="cron-service"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"

# Function to read YAML file and format secrets for gcloud command
format_secrets() {
    local file=$1
    local result=""
    while IFS=':' read -r key value; do
        # Trim leading/trailing whitespace
        key=$(echo $key | xargs)
        value=$(echo $value | xargs)
        result+="--set-secrets=$key=$value,"
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
  $SECRETS \
  --add-cloudsql-instances=monitoring-agents:us-central1:notional


# Get the URL of the deployed service
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

# Replace PLACEHOLDER_URL with actual service URL in jobCron.yaml
sed -i "s|PLACEHOLDER_URL|$SERVICE_URL|g" cron.yaml

# Import Cloud Scheduler jobs from YAML file
gcloud scheduler jobs import --location=$REGION cron.yaml

echo "Deployment and scheduler job creation completed."