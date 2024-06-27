# vault-apy

Used to generate historical and future vault apy based on received token rewards

## Building
```
yarn build
```

## Run locally

First create .env file and fill it with required env variables, check .env.example

Run without arguments for daily calculation for all vaults
Run with historical as first argument for calculations for the last 7 days for all vaults
Run with historical as first argument and vault address as second to only calculate for single vault

Run with env DEBUG variable set to vault-apy to get detailed logs
```

nvm use 20 # switch to node 20

yarn start-dev
DEBUG=vault-apy yarn start-dev
yarn start-dev historical
yarn start-dev historical network <vaultAddress>
```

## Deploy

```
# Run this once to configure the docker registry
gcloud auth configure-docker us-east1-docker.pkg.dev

./deploy.sh
```
Check deploy script for additional info about the deployment process
