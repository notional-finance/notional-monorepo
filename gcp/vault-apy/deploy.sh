docker build -t us-east1-docker.pkg.dev/monitoring-agents/notional-repo/vault-apy:latest ./

docker push us-east1-docker.pkg.dev/monitoring-agents/notional-repo/vault-apy:latest

gcloud run jobs replace job.yaml

# If there is need to update currently configured scheduler, uncomment next command and
# change `--scheduler=` value to new cron pattern
# Scheduler is configured to always run latest version of the docker image so we don't need to update it
# on each new deploy
# gcloud scheduler jobs update http vault-apy-scheduler \
#   --location "us-east1" \
#   --schedule="1 0 * * *" \
#   --max-retry-attempts=3 \
#   --min-backoff=5m \
#   --max-backoff=15m \
#   --uri="https://us-east1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/monitoring-agents/jobs/vault-apy:run" \
#   --http-method POST \
#   --oauth-service-account-email 663932775145-compute@developer.gserviceaccount.com
