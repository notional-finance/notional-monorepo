#!/bin/sh
set -e

./build.sh
gcloud --project monitoring-agents app deploy app2.yaml # app.yaml app2.yaml cron.yaml
