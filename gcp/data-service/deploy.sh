#!/bin/sh

rm -rf ./dist
cp -r ../../dist .
gcloud app deploy
