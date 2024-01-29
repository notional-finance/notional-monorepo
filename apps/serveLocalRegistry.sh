yarn nx serve registry-configuration --port 8885 &
yarn nx serve registry-tokens --port 8886 &
yarn nx serve registry-vaults --port 8887 &
yarn nx serve registry-oracles --port 8888 &
yarn nx serve registry-exchange --port 8889 &
yarn nx serve data --env dev --port 8890 &
yarn node apps/localAPI.js
