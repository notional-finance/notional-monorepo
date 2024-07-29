#!/bin/sh
set -e

./build.sh
gcloud --verbosity=debug --project monitoring-agents app deploy app.yaml cron.yaml
