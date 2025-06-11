#!/bin/bash

# Triggers the build process in the background
yarn nx build web --watch --configuration=development &

# Wait a bit for the build directory to be cleared by the build process
sleep 5

# Wait for the build directory to exist and be ready
while true; do
  if [ -d "../../dist/apps/web" ]; then
    echo "Build directory found, starting wrangler..."
    break
  fi
  
  echo "Waiting for build to complete..."
  sleep 1
done

# Start wrangler with live reload
yarn wrangler dev --local --live-reload --config ./apps/web/wrangler.toml