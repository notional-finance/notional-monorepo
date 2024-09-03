#!/bin/bash
set -e

# Cron jobs to deploy, format is "Description|URL|Schedule"
cron_jobs=(
    "Risk_Service|/calculateRisk|*/10 * * * *"
    "Sync_Dune|/syncDune|30 1 * * *"
    "Calculate_Points|/calculatePoints|5 1 * * *"
    "Sync_Generic_Data|/syncGenericData|0 * * * *"
    "Sync_Oracle_Data|/syncOracleData|0 * * * *"
    "Sync_Accounts_Arbitrum|/syncAccounts?network=arbitrum|*/20 * * * *"
    "Sync_Accounts_Mainnet|/syncAccounts?network=mainnet|*/20 * * * *"
    "Sync_Vault_Accounts_Arbitrum|/syncVaultAccounts?network=arbitrum|*/20 * * * *"
    "Sync_Vault_Accounts_Mainnet|/syncVaultAccounts?network=mainnet|*/20 * * * *"
)

# Set the base URI as an environment variable
# Get the function URI using gcloud
BASE_URI=$(gcloud functions describe cron-service --region=us-central1 --format='value(url)')
echo "Base URI: $BASE_URI"

# Create jobs from cron_jobs array
for job in "${cron_jobs[@]}"; do
    IFS='|' read -r description url schedule <<< "$job"
    
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


# gcloud run services add-iam-policy-binding cron-service \
#     --member="serviceAccount:monitoring-agents@appspot.gserviceaccount.com" \
#     --role="roles/run.invoker"