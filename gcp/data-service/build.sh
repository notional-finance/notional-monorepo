#!/bin/sh
set -e

echo "Current directory: $(pwd)"

cd ../..
echo "$(pwd)"
rm -rf ./dist
yarn nx build risk-engine
cd -
rm -rf ./dist
rm -rf ./node_modules
cp -r ../../dist .
yarn