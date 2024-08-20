#!/bin/sh
set -e

./build.sh
gcloud --project monitoring-agents app deploy app.yaml
