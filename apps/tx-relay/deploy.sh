echo "Deploying tx-relay service"

cp package.json ../../dist/apps/tx-relay
cd ../../dist/apps/tx-relay

gcloud --project monitoring-agents \
    functions deploy tx-relay \
    --region us-central1 \
    --runtime nodejs22 \
    --trigger-http \
    --allow-unauthenticated \
    --entry-point=txRelayService \
    --gen2 \
    --timeout=600 \
    --concurrency=1 \
    --cpu=1 \
    --memory=256 \
    --service-account=monitoring-agents@appspot.gserviceaccount.com \
  --set-secrets=\
AUTH_TOKEN=projects/663932775145/secrets/TX_RELAY_AUTH_TOKEN/versions/latest,\
DD_API_KEY=projects/663932775145/secrets/DD_API_KEY/versions/latest
