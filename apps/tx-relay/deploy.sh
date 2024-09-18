echo "Deploying tx-relay service"

cp package.json ./dist
cd ./dist

gcloud --project monitoring-agents \
    functions deploy tx-relay \
    --region us-central1 \
    --runtime nodejs22 \
    --trigger-http \
    --allow-unauthenticated \
    --entry-point=txRelayService \
    --gen2 \
    --timeout=600 \
    --max-instances=1 \
    --concurrency=1 \
    --cpu=1 \
    --memory=256 \
    --service-account=monitoring-agents@appspot.gserviceaccount.com \
  --set-secrets=\
AUTH_TOKEN=projects/663932775145/secrets/TX_RELAY_AUTH_TOKEN/versions/latest,\
DD_API_KEY=projects/663932775145/secrets/DD_API_KEY/versions/latest

echo "Deploying rebalance service"

gcloud --project monitoring-agents \
    functions deploy rebalance-service \
    --region us-central1 \
    --runtime nodejs20 \
    --trigger-http \
    --no-allow-unauthenticated \
    --entry-point=rebalanceService \
    --gen2 \
    --timeout=600 \
    --concurrency=1 \
    --cpu=1 \
    --memory=256 \
    --max-instances=1 \
    --service-account=monitoring-agents@appspot.gserviceaccount.com \
  --set-secrets=\
DD_API_KEY=projects/663932775145/secrets/DD_API_KEY/versions/latest

# Cron jobs to deploy, format is "Description|URL|Schedule"
cron_jobs="Rebalance_Sepolia|/sepolia|* * * * *"

# Set the base URI as an environment variable
# Get the function URI using gcloud
BASE_URI=$(gcloud functions describe rebalance-service --region=us-central1 --format='value(url)')
echo "Base URI: $BASE_URI"

# Create jobs from cron_jobs array
echo "$cron_jobs" | while IFS='|' read -r description url schedule; do
    # Create/update the job
    job_name=$(echo "$description" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

    # Check if the job already exists
    if gcloud scheduler jobs describe "$job_name" --location=us-central1 &>/dev/null; then
      ACTION="update"
    else
      ACTION="create"
    fi

    gcloud scheduler jobs $ACTION http "$job_name" \
        --location=us-central1 \
        --schedule="$schedule" \
        --uri="${BASE_URI}${url}" \
        --http-method GET \
        --attempt-deadline=1800s \
        --oidc-service-account-email=monitoring-agents@appspot.gserviceaccount.com \
        --oidc-token-audience="${BASE_URI}" \
        --description="$description"
    
    echo "${ACTION}d job: $job_name $url $schedule"
done
