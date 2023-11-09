#!/bin/sh
set -e

echo "Current directory: $(pwd)"

cd ../.. && echo "$(pwd)" && yarn nx build core-entities
cd -
rm -rf ./dist
rm -rf ./node_modules
cp -r ../../dist .
yarn
gcloud app deploy
