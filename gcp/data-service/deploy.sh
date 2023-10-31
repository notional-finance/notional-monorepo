#!/bin/sh

rm -rf ./dist
rm -rf ./node_modules
cp -r ../../dist .
yarn
gcloud app deploy
