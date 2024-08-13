#!/bin/sh
set -e

echo "Current directory: $(pwd)"

cd ../..
echo "$(pwd)"
rm -rf ./dist
yarn nx build common-icons
cd -
yarn install