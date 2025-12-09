#!/bin/bash

# Backfill script for the three new Midas oracles
# Usage: ./backfill-midas-oracles.sh <startTime> <endTime> [baseUrl]

# Check if required arguments are provided
if [ $# -lt 2 ]; then
  echo "Usage: $0 <startTime> <endTime> [baseUrl]"
  echo "Example: $0 1704067200 1704153600"
  exit 1
fi

START_TIME=$1
END_TIME=$2
BASE_URL=${3:-"https://us-central1-monitoring-agents.cloudfunctions.net/data-service"}

# Load auth token from .dev.vars if it exists
if [ -f ".dev.vars" ]; then
  export $(cat .dev.vars | grep -v '^#' | xargs)
fi

# Check if auth token is set
if [ -z "$DATA_SERVICE_AUTH_TOKEN" ]; then
  echo "Error: DATA_SERVICE_AUTH_TOKEN is not set"
  echo "Please set it in .dev.vars or export it as an environment variable"
  exit 1
fi

# Array of oracle contract addresses
ORACLES=(
  "0x8D51DBC85cEef637c97D02bdaAbb5E274850e68C"  # mF-ONE to USD
  "0x43881B05C3BE68B2d33eb70aDdF9F666C5005f68"  # mHYPER to USD
  "0x84303e5568C7B167fa4fEBc6253CDdfe12b7Ee4B"  # mAPOLLO to USD
)

ORACLE_NAMES=(
  "mF-ONE to USD"
  "mHYPER to USD"
  "mAPOLLO to USD"
)

echo "Starting backfill from $START_TIME to $END_TIME"
echo "Base URL: $BASE_URL"
echo ""

# Loop through each oracle and run backfill
for i in "${!ORACLES[@]}"; do
  ORACLE="${ORACLES[$i]}"
  NAME="${ORACLE_NAMES[$i]}"

  echo "[$((i+1))/3] Backfilling ${NAME} (${ORACLE})..."

  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    "${BASE_URL}/backfillGenericData?startTime=${START_TIME}&endTime=${END_TIME}&onlyContractAddress=${ORACLE}" \
    -H "x-auth-token: ${DATA_SERVICE_AUTH_TOKEN}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Success: ${NAME}"
  else
    echo "✗ Failed: ${NAME} (HTTP ${HTTP_CODE})"
    echo "  Response: ${BODY}"
  fi

  echo ""
done

echo "Backfill complete!"
